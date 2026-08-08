import { useRef, useState } from "react";
import { Star, Upload, X } from "lucide-react";
import api from "../api/axios";

function StarPicker({ value, onChange }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
          className="transition-transform hover:scale-110 active:scale-95"
        >
          <Star
            className={`w-6 h-6 transition-colors ${
              star <= (hover || value)
                ? "fill-amber-400 text-amber-400"
                : "text-gray-300"
            }`}
          />
        </button>
      ))}
      <span className="ml-2 text-sm text-gray-500">
        {["", "Poor", "Fair", "Good", "Very good", "Excellent"][hover || value]}
      </span>
    </div>
  );
}

export default function ReviewForm({
  initialData = {},
  onSubmit,
  submitLabel = "Post review",
  loading = false,
}) {
  const [form, setForm] = useState({
    rating: initialData.rating || 5,
    comment: initialData.comment || "",
  });
  // imageUrls holds the final hosted URLs sent to the server
  const [imageUrls, setImageUrls] = useState(initialData.images || []);
  // previews holds { localUrl, uploading, error } per file slot
  const [previews, setPreviews] = useState(
    (initialData.images || []).map((url) => ({ localUrl: url, uploading: false, error: "" }))
  );
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  const set = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleFilesChange = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    // Limit total to 5 images
    const slotsLeft = 5 - previews.length;
    const toUpload = files.slice(0, slotsLeft);

    // Add pending preview slots immediately
    const newSlots = toUpload.map((file) => ({
      localUrl: URL.createObjectURL(file),
      uploading: true,
      error: "",
    }));
    setPreviews((prev) => [...prev, ...newSlots]);

    // Upload all files in one request
    try {
      const formData = new FormData();
      toUpload.forEach((file) => formData.append("images", file));
      // Do NOT set Content-Type — let the browser set it with the correct boundary
      const res = await api.post("/reviews/images", formData);
      const uploaded = res.data.imageUrls || [];

      // Replace pending slots with real URLs
      setPreviews((prev) => {
        const updated = [...prev];
        const start = updated.length - toUpload.length;
        uploaded.forEach((url, i) => {
          updated[start + i] = { localUrl: url, uploading: false, error: "" };
        });
        return updated;
      });
      setImageUrls((prev) => [...prev, ...uploaded]);
    } catch (err) {
      // Mark slots as errored
      setPreviews((prev) => {
        const updated = [...prev];
        const start = updated.length - toUpload.length;
        for (let i = start; i < updated.length; i++) {
          updated[i] = { ...updated[i], uploading: false, error: "Upload failed" };
        }
        return updated;
      });
      setError(err.response?.data?.message || "Image upload failed");
    }

    // Reset file input so same files can be re-selected
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeImage = (index) => {
    setPreviews((prev) => prev.filter((_, i) => i !== index));
    setImageUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    // Block submit if any image is still uploading
    if (previews.some((p) => p.uploading)) {
      setError("Please wait for images to finish uploading.");
      return;
    }
    try {
      await onSubmit({
        rating: Number(form.rating),
        comment: form.comment,
        images: imageUrls,
      });
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save review");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <p className="alert-error">{error}</p>}

      <div>
        <label className="input-label">Your rating</label>
        <StarPicker value={form.rating} onChange={(v) => setForm((p) => ({ ...p, rating: v }))} />
      </div>

      <div>
        <label htmlFor="review-comment" className="input-label">Review</label>
        <textarea
          id="review-comment"
          name="comment"
          rows={4}
          value={form.comment}
          onChange={set}
          required
          minLength={5}
          placeholder="Share your experience…"
          className="input resize-none"
        />
      </div>

      {/* Image upload */}
      <div>
        <label className="input-label">
          Photos{" "}
          <span className="text-gray-400 font-normal">(optional · up to 5)</span>
        </label>

        {/* Previews grid */}
        {previews.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {previews.map((p, i) => (
              <div
                key={i}
                className="relative w-20 h-20 rounded-xl overflow-hidden border border-gray-200 bg-gray-100 group"
              >
                <img
                  src={p.localUrl}
                  alt={`Preview ${i + 1}`}
                  className={`w-full h-full object-cover transition-opacity ${p.uploading ? "opacity-40" : "opacity-100"}`}
                />
                {p.uploading && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="spinner w-5 h-5" />
                  </div>
                )}
                {p.error && (
                  <div className="absolute inset-0 flex items-center justify-center bg-red-50/80">
                    <span className="text-[10px] text-red-500 font-semibold text-center px-1">Failed</span>
                  </div>
                )}
                {!p.uploading && (
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white
                               flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="Remove image"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {previews.length < 5 && (
          <>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="btn btn-outline btn-sm gap-2"
            >
              <Upload className="w-3.5 h-3.5" /> Add photos
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleFilesChange}
            />
          </>
        )}
      </div>

      <button
        type="submit"
        className="btn btn-primary btn-md w-full"
        disabled={loading || previews.some((p) => p.uploading)}
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <span className="spinner" /> Saving…
          </span>
        ) : submitLabel}
      </button>
    </form>
  );
}
