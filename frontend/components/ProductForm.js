"use client";
import { useState } from "react";
import Field from "./Field";

export default function ProductForm({ initial, categories = [], onSubmit, onCancel, busy, serverError }) {
  const [name, setName] = useState(initial?.name || "");
  const [category, setCategory] = useState(initial?.category || (categories[0] || "Face Rituals"));
  const [customCat, setCustomCat] = useState("");
  const [description, setDescription] = useState(initial?.description || "");
  const [price, setPrice] = useState(initial ? String(initial.price) : "");
  const [stock, setStock] = useState(initial ? String(initial.stock) : "10");
  const [imageUrl, setImageUrl] = useState(initial?.image_url || "/products/placeholder.svg");
  const [errors, setErrors] = useState({});

  function validate() {
    const e = {};
    if (!name.trim()) e.name = "Enter a product name.";
    const cat = category === "__new__" ? customCat.trim() : category;
    if (!cat) e.category = "Choose or enter a category.";
    const p = parseInt(price, 10);
    if (!p || p <= 0) e.price = "Enter a price in rupees.";
    const s = parseInt(stock, 10);
    if (isNaN(s) || s < 0) e.stock = "Enter available stock quantity.";
    return e;
  }

  function submit(ev) {
    ev.preventDefault();
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length) return;
    const cat = category === "__new__" ? customCat.trim() : category;
    onSubmit({
      name: name.trim(),
      category: cat,
      description: description.trim(),
      price: parseInt(price, 10),
      stock: parseInt(stock, 10),
      image_url: imageUrl.trim() || "/products/placeholder.svg",
    });
  }

  return (
    <form className="panel stack" onSubmit={submit} noValidate style={{ marginBottom: "2rem" }}>
      <h2>{initial ? "Edit Formulation" : "New Botanical Formulation"}</h2>
      {serverError && <div className="alert alert-error">{serverError}</div>}
      <Field label="Formulation Name" name="name" value={name} onChange={(e) => setName(e.target.value)} error={errors.name} />
      <div className="field">
        <label htmlFor="cat-select">Category</label>
        <select
          id="cat-select"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
          <option value="__new__">+ New category...</option>
        </select>
      </div>
      {category === "__new__" && (
        <Field label="New Category Name" name="customCat" value={customCat} onChange={(e) => setCustomCat(e.target.value)} error={errors.category} />
      )}
      <div className="field">
        <label htmlFor="field-desc">Botanical Description & Key Ingredients</label>
        <textarea
          id="field-desc"
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      <div className="form-grid two">
        <Field label="Price (₹)" name="price" type="number" min="1" value={price} onChange={(e) => setPrice(e.target.value)} error={errors.price} />
        <Field label="Stock Quantity" name="stock" type="number" min="0" value={stock} onChange={(e) => setStock(e.target.value)} error={errors.stock} />
      </div>
      <Field label="Image URL or Path" name="imageUrl" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
      <div className="row">
        <button className="btn" disabled={busy}>{busy ? "Saving..." : initial ? "Save Changes" : "Create Product"}</button>
        <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}
