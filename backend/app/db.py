"""Vana Botanicals Database Layer.
Supports both Supabase PostgREST and standalone local SQLite database with zero-setup fallback.
"""
from datetime import datetime, timezone
import json
import os
import sqlite3
import uuid
import httpx

from . import config

_client: httpx.AsyncClient | None = None


class DBError(Exception):
    def __init__(self, status: int, message: str):
        super().__init__(message)
        self.status = status
        self.message = message


def client() -> httpx.AsyncClient:
    global _client
    if _client is None:
        _client = httpx.AsyncClient(timeout=15.0)
    return _client


async def close() -> None:
    global _client
    if _client is not None:
        await _client.aclose()
        _client = None


# --- Supabase PostgREST implementation ---

async def _send(method: str, path: str, params=None, body=None, prefer: str | None = None):
    headers = {
        "apikey": config.SUPABASE_SERVICE_ROLE_KEY,
        "Authorization": f"Bearer {config.SUPABASE_SERVICE_ROLE_KEY}",
        "Content-Type": "application/json",
    }
    if prefer:
        headers["Prefer"] = prefer
    try:
        res = await client().request(
            method, f"{config.SUPABASE_URL}{path}", params=params, json=body, headers=headers
        )
    except httpx.HTTPError as exc:
        raise DBError(0, "unreachable") from exc

    if res.status_code >= 400:
        try:
            message = res.json().get("message", "")
        except Exception:
            message = res.text[:200]
        raise DBError(res.status_code, message)

    if not res.content:
        return None
    return res.json()


# --- Standalone Local SQLite Implementation ---

LOCAL_DB_PATH = os.path.join(os.path.dirname(__file__), "..", "local_vana.db")

SAMPLE_PRODUCTS = [
    {
        "id": "22222222-2222-2222-2222-222222222201",
        "name": "Kumkumadi Miraculous Beauty Fluid, 30 ml",
        "category": "Face Rituals",
        "description": "Authentic classical Ayurvedic recipe infused with Kashmiri saffron, red sandalwood, and 26 therapeutic botanicals. Enhances luminosity and evening tone.",
        "price": 1499,
        "stock": 35,
        "image_url": "/products/kumkumadi.jpg",
    },
    {
        "id": "22222222-2222-2222-2222-222222222202",
        "name": "Wild Himalayan Rosehip Glow Oil, 30 ml",
        "category": "Face Rituals",
        "description": "Cold-pressed high-altitude wild rosehip seed oil rich in pro-vitamin A and omegas 3 and 6. Light, fast-absorbing and deeply restoring.",
        "price": 899,
        "stock": 40,
        "image_url": "/products/rosehip.jpg",
    },
    {
        "id": "22222222-2222-2222-2222-222222222203",
        "name": "Kashmiri Saffron Restorative Night Balm, 50 g",
        "category": "Face Rituals",
        "description": "Rich nocturnal treatment with pure mogra saffron, ashwagandha and cold-pressed almond butter to rejuvenate depleted skin barrier overnight.",
        "price": 1249,
        "stock": 20,
        "image_url": "/products/saffron-cream.jpg",
    },
    {
        "id": "22222222-2222-2222-2222-222222222204",
        "name": "Vetiver & Holy Basil Clarifying Mist, 100 ml",
        "category": "Mists & Tonics",
        "description": "Copper-distilled wild vetiver roots and fresh tulsi leaves. Balances pH, tones pores and grounds the senses after cleansing.",
        "price": 549,
        "stock": 50,
        "image_url": "/products/vetiver-mist.jpg",
    },
    {
        "id": "22222222-2222-2222-2222-222222222205",
        "name": "Himalayan Pink Clay Purifying Mask, 75 g",
        "category": "Ritual Treatments",
        "description": "Mineral-rich pink salt clay blended with raw neem leaf and wild turmeric. Gently unclogs congested pores without stripping essential moisture.",
        "price": 699,
        "stock": 15,
        "image_url": "/products/clay-mask.jpg",
    },
    {
        "id": "22222222-2222-2222-2222-222222222206",
        "name": "Cold-Pressed Moringa Body Whip, 100 g",
        "category": "Body Care",
        "description": "Decadent botanical body butter churned from raw moringa seeds, gotu kola and unrefined shea. Long-lasting velvet hydration for dry limbs.",
        "price": 799,
        "stock": 25,
        "image_url": "/products/moringa-butter.jpg",
    },
    {
        "id": "22222222-2222-2222-2222-222222222207",
        "name": "Gotu Kola & Bakuchiol Youth Elixir, 30 ml",
        "category": "Face Rituals",
        "description": "Plant-based natural retinol alternative derived from babchi seeds paired with centella asiatica. Currently out of stock until next harvest.",
        "price": 1349,
        "stock": 0,
        "image_url": "/products/bakuchiol.jpg",
    },
    {
        "id": "22222222-2222-2222-2222-222222222208",
        "name": "The Radiance Daily Ritual Trio",
        "category": "Ritual Sets",
        "description": "Complete introductory regimen containing Vetiver Mist (50 ml), Rosehip Glow Oil (15 ml), and Pink Clay Mask (30 g) in a handcrafted linen gift box.",
        "price": 2499,
        "stock": 8,
        "image_url": "/products/ritual-box.jpg",
    },
    {
        "id": "22222222-2222-2222-2222-222222222209",
        "name": "Artisanal Neem Wood Comb & Sculpting Tool",
        "category": "Tools",
        "description": "Sustainably hand-carved medicinal neem wood comb paired with smooth dual-sided facial contouring tool. Promotes microcirculation.",
        "price": 449,
        "stock": 12,
        "image_url": "/products/gua-sha.jpg",
    },
]


def _get_local_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(LOCAL_DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def _init_local_db():
    conn = _get_local_connection()
    with conn:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS profiles (
                id TEXT PRIMARY KEY,
                email TEXT NOT NULL,
                role TEXT NOT NULL DEFAULT 'customer',
                created_at TEXT NOT NULL
            );
            """
        )
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS products (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                category TEXT NOT NULL,
                description TEXT NOT NULL DEFAULT '',
                price INTEGER NOT NULL,
                stock INTEGER NOT NULL DEFAULT 0,
                image_url TEXT NOT NULL DEFAULT '',
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            );
            """
        )
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS orders (
                id TEXT PRIMARY KEY,
                user_id TEXT,
                status TEXT NOT NULL DEFAULT 'new',
                payment_status TEXT NOT NULL DEFAULT 'paid',
                total INTEGER NOT NULL DEFAULT 0,
                shipping TEXT NOT NULL,
                created_at TEXT NOT NULL
            );
            """
        )
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS order_items (
                id TEXT PRIMARY KEY,
                order_id TEXT NOT NULL,
                product_id TEXT,
                name TEXT NOT NULL,
                unit_price INTEGER NOT NULL,
                quantity INTEGER NOT NULL
            );
            """
        )

        cur = conn.execute("SELECT COUNT(*) as cnt FROM profiles")
        if cur.fetchone()["cnt"] == 0:
            now = datetime.now(timezone.utc).isoformat()
            conn.execute(
                "INSERT INTO profiles (id, email, role, created_at) VALUES (?, ?, ?, ?)",
                ("00000000-0000-0000-0000-000000000001", "admin@vanabotanicals.com", "admin", now),
            )
            conn.execute(
                "INSERT INTO profiles (id, email, role, created_at) VALUES (?, ?, ?, ?)",
                ("00000000-0000-0000-0000-000000000002", "customer@vanabotanicals.com", "customer", now),
            )

        cur = conn.execute("SELECT COUNT(*) as cnt FROM products")
        if cur.fetchone()["cnt"] == 0:
            now = datetime.now(timezone.utc).isoformat()
            for p in SAMPLE_PRODUCTS:
                conn.execute(
                    """
                    INSERT INTO products (id, name, category, description, price, stock, image_url, created_at, updated_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """,
                    (
                        p["id"],
                        p["name"],
                        p["category"],
                        p["description"],
                        p["price"],
                        p["stock"],
                        p["image_url"],
                        now,
                        now,
                    ),
                )
    conn.close()


if config.IS_LOCAL_MODE:
    _init_local_db()


def _local_select(table: str, params: dict):
    conn = _get_local_connection()
    try:
        if table == "products":
            if "id" in params:
                pid = params["id"].replace("eq.", "")
                cur = conn.execute("SELECT * FROM products WHERE id = ?", (pid,))
                row = cur.fetchone()
                return [dict(row)] if row else []
            elif params.get("select") == "stock":
                cur = conn.execute("SELECT stock FROM products")
                return [dict(r) for r in cur.fetchall()]
            else:
                cur = conn.execute("SELECT * FROM products ORDER BY created_at ASC")
                return [dict(r) for r in cur.fetchall()]

        elif table == "profiles":
            pid = params.get("id", "").replace("eq.", "")
            cur = conn.execute("SELECT role FROM profiles WHERE id = ?", (pid,))
            row = cur.fetchone()
            return [dict(row)] if row else []

        elif table == "orders":
            if params.get("select") == "total,status":
                cur = conn.execute("SELECT total, status FROM orders")
                return [dict(r) for r in cur.fetchall()]

            if "user_id" in params:
                uid = params["user_id"].replace("eq.", "")
                cur = conn.execute(
                    "SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC", (uid,)
                )
                orders = [dict(r) for r in cur.fetchall()]
            else:
                cur = conn.execute("SELECT * FROM orders ORDER BY created_at DESC")
                orders = [dict(r) for r in cur.fetchall()]

            for o in orders:
                if isinstance(o["shipping"], str):
                    try:
                        o["shipping"] = json.loads(o["shipping"])
                    except Exception:
                        pass
                cur_items = conn.execute(
                    "SELECT * FROM order_items WHERE order_id = ?", (o["id"],)
                )
                o["order_items"] = [dict(item) for item in cur_items.fetchall()]

                if "profiles(email)" in params.get("select", ""):
                    cur_p = conn.execute(
                        "SELECT email FROM profiles WHERE id = ?", (o.get("user_id"),)
                    )
                    row_p = cur_p.fetchone()
                    o["profiles"] = {"email": row_p["email"]} if row_p else None

            return orders

        return []
    finally:
        conn.close()


def _local_insert(table: str, row: dict) -> dict:
    conn = _get_local_connection()
    try:
        now = datetime.now(timezone.utc).isoformat()
        if table == "products":
            new_id = str(uuid.uuid4())
            with conn:
                conn.execute(
                    """
                    INSERT INTO products (id, name, category, description, price, stock, image_url, created_at, updated_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """,
                    (
                        new_id,
                        row["name"],
                        row["category"],
                        row.get("description", ""),
                        row["price"],
                        row.get("stock", 0),
                        row.get("image_url", ""),
                        now,
                        now,
                    ),
                )
            cur = conn.execute("SELECT * FROM products WHERE id = ?", (new_id,))
            return dict(cur.fetchone())
        raise DBError(400, f"Insert not supported for {table}")
    finally:
        conn.close()


def _local_update(table: str, params: dict, values: dict) -> list:
    conn = _get_local_connection()
    try:
        if table == "products":
            pid = params.get("id", "").replace("eq.", "")
            set_parts = []
            vals = []
            for k, v in values.items():
                set_parts.append(f"{k} = ?")
                vals.append(v)
            vals.append(pid)
            with conn:
                conn.execute(f"UPDATE products SET {', '.join(set_parts)} WHERE id = ?", vals)
            cur = conn.execute("SELECT * FROM products WHERE id = ?", (pid,))
            row = cur.fetchone()
            return [dict(row)] if row else []

        elif table == "orders":
            oid = params.get("id", "").replace("eq.", "")
            with conn:
                conn.execute("UPDATE orders SET status = ? WHERE id = ?", (values["status"], oid))
            cur = conn.execute("SELECT * FROM orders WHERE id = ?", (oid,))
            row = cur.fetchone()
            return [dict(row)] if row else []

        return []
    finally:
        conn.close()


def _local_delete(table: str, params: dict) -> list:
    conn = _get_local_connection()
    try:
        if table == "products":
            pid = params.get("id", "").replace("eq.", "")
            cur = conn.execute("SELECT * FROM products WHERE id = ?", (pid,))
            row = cur.fetchone()
            if not row:
                return []
            res = dict(row)
            with conn:
                conn.execute("DELETE FROM products WHERE id = ?", (pid,))
            return [res]
        return []
    finally:
        conn.close()


def _local_place_order(p_user: str, p_items: list, p_shipping: dict) -> str:
    if not p_items:
        raise DBError(400, "EMPTY_CART")

    conn = _get_local_connection()
    try:
        with conn:
            products_by_id = {}
            for item in p_items:
                pid = str(item["product_id"])
                cur = conn.execute("SELECT * FROM products WHERE id = ?", (pid,))
                row = cur.fetchone()
                if not row:
                    raise DBError(409, "PRODUCT_MISSING")
                prod = dict(row)
                if prod["stock"] < item["quantity"]:
                    raise DBError(409, f"OUT_OF_STOCK:{prod['name']}")
                products_by_id[pid] = prod

            order_id = str(uuid.uuid4())
            now = datetime.now(timezone.utc).isoformat()
            total = 0

            conn.execute(
                """
                INSERT INTO orders (id, user_id, status, payment_status, total, shipping, created_at)
                VALUES (?, ?, 'new', 'paid', 0, ?, ?)
                """,
                (order_id, p_user, json.dumps(p_shipping), now),
            )

            for item in p_items:
                pid = str(item["product_id"])
                qty = item["quantity"]
                prod = products_by_id[pid]
                item_id = str(uuid.uuid4())

                conn.execute(
                    "UPDATE products SET stock = stock - ?, updated_at = ? WHERE id = ?",
                    (qty, now, pid),
                )
                conn.execute(
                    """
                    INSERT INTO order_items (id, order_id, product_id, name, unit_price, quantity)
                    VALUES (?, ?, ?, ?, ?, ?)
                    """,
                    (item_id, order_id, pid, prod["name"], prod["price"], qty),
                )
                total += prod["price"] * qty

            conn.execute("UPDATE orders SET total = ? WHERE id = ?", (total, order_id))
            return order_id
    finally:
        conn.close()


# --- Public Interface ---

async def select(table: str, params: dict):
    if config.IS_LOCAL_MODE:
        return _local_select(table, params)
    return await _send("GET", f"/rest/v1/{table}", params=params)


async def insert(table: str, row: dict) -> dict:
    if config.IS_LOCAL_MODE:
        return _local_insert(table, row)
    rows = await _send("POST", f"/rest/v1/{table}", body=row, prefer="return=representation")
    return rows[0]


async def update(table: str, params: dict, values: dict) -> list:
    if config.IS_LOCAL_MODE:
        return _local_update(table, params, values)
    return await _send(
        "PATCH", f"/rest/v1/{table}", params=params, body=values, prefer="return=representation"
    )


async def delete(table: str, params: dict) -> list:
    if config.IS_LOCAL_MODE:
        return _local_delete(table, params)
    return await _send("DELETE", f"/rest/v1/{table}", params=params, prefer="return=representation")


async def rpc(fn: str, args: dict):
    if config.IS_LOCAL_MODE:
        if fn == "place_order":
            return _local_place_order(args["p_user"], args["p_items"], args["p_shipping"])
        raise DBError(400, f"RPC {fn} not implemented in local mode")
    return await _send("POST", f"/rest/v1/rpc/{fn}", body=args)
