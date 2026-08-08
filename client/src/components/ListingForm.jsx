import { useRef, useState } from "react";
import { DollarSign, MapPin, Image, FileText, Globe, Type, Upload, X } from "lucide-react";
import api from "../api/axios";

const emptyForm = {
  title: "",
  description: "",
  image: "",
  price: "",
  location: "",
  country: "",
};

function Field({ label, icon: Icon, children }) {
  return (
    <div className="space-y-1.5">
      <label className="input-label flex items-center gap-1.5">
        {Icon && <Icon className="w-3.5 h-3.5 text-gray-400" />}
        {label}
      </label>
      {children}
    </div>
  );
}

export default function ListingForm({ initialData, onSubmit, submitLabel = "Save listing" }) {
  const [form, setForm] = useState(initialData || emptyForm);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(initialData?.image || "");
  const fileInputRef = useRef(null);

  const set = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show local preview immediately
    const localUrl = URL.createObjectURL(file);
    setPreview(localUrl);

    setUploading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("image", file);
      const res = await api.post("/uploads/image", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const imageUrl = res.data.imageUrl;
      setForm((p) => ({ ...p, image: imageUrl }));
      setPreview(imageUrl);
    } catch (err) {
      setError(err.response?.data?.message || "Image upload failed");
      setPreview(form.image || "");
    } finally {
      setUploading(false);
    }
  };

  const clearImage = () => {
    setForm((p) => ({ ...p, image: "" }));
    setPreview("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await onSubmit({ ...form, price: Number(form.price) });
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && <p className="alert-error">{error}</p>}

      <Field label="Title" icon={Type}>
        <input
          name="title"
          value={form.title}
          onChange={set}
          required
          placeholder="Cozy beachfront villa…"
          className="input"
        />
      </Field>

      <Field label="Description" icon={FileText}>
        <textarea
          name="description"
          value={form.description}
          onChange={set}
          rows={4}
          placeholder="Describe what makes this place special…"
          className="input resize-none"
        />
      </Field>

      {/* Image upload */}
      <Field label="Listing Image" icon={Image}>
        <div className="space-y-3">
          {/* Upload button */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="btn btn-outline btn-sm gap-2"
            >
              {uploading ? (
                <><span className="spinner w-3.5 h-3.5" /> Uploading…</>
              ) : (
                <><Upload className="w-3.5 h-3.5" /> Upload image</>
              )}
            </button>
            <span className="text-xs text-gray-400">or paste a URL below</span>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />

          {/* URL fallback input */}
          <input
            name="image"
            value={form.image}
            onChange={(e) => {
              set(e);
              setPreview(e.target.value);
            }}
            placeholder="https://…"
            className="input"
          />

          {/* Preview */}
          {preview && (
            <div className="relative rounded-xl overflow-hidden h-48 bg-gray-100 group">
              <img
                src={preview}
                alt="Preview"
                className="w-full h-full object-cover"
                onError={(e) => (e.currentTarget.style.display = "none")}
              />
              <button
                type="button"
                onClick={clearImage}
                className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 text-white
                           flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Remove image"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </Field>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Price per night (₹)" icon={DollarSign}>
          <input
            name="price"
            type="number"
            value={form.price}
            onChange={set}
            required
            min="0"
            placeholder="2500"
            className="input"
          />
        </Field>
        <Field label="Country" icon={Globe}>
          <input
            name="country"
            value={form.country}
            onChange={set}
            placeholder="India"
            className="input"
          />
        </Field>
      </div>

      <Field label="Location / City" icon={MapPin}>
        <input
          name="location"
          value={form.location}
          onChange={set}
          placeholder="Goa, Mumbai…"
          className="input"
        />
      </Field>

      <button type="submit" className="btn btn-primary btn-lg w-full mt-2" disabled={loading || uploading}>
        {loading ? (
          <span className="flex items-center gap-2">
            <span className="spinner" /> Saving…
          </span>
        ) : submitLabel}
      </button>
    </form>
  );
}
