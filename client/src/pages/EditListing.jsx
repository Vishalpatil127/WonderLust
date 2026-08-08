import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Pencil } from "lucide-react";
import api from "../api/axios";
import ListingForm from "../components/ListingForm";

export default function EditListing() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [initialData, setInitialData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get(`/listings/${id}`)
      .then((res) => {
        const { title, description, image, price, location, country } = res.data.listing;
        setInitialData({ title, description, image, price, location, country });
      })
      .catch((err) => setError(err.response?.data?.message || "Failed to load listing"));
  }, [id]);

  const handleSubmit = async (data) => {
    await api.put(`/listings/${id}`, data);
    navigate(`/listings/${id}`);
  };

  if (error) return (
    <div className="page-container py-20">
      <div className="alert-error max-w-md mx-auto">{error}</div>
    </div>
  );

  if (!initialData) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="spinner w-8 h-8" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="page-container max-w-2xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
            <Pencil className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">Edit listing</h1>
            <p className="text-sm text-gray-400">Update the details of your property</p>
          </div>
        </div>

        {/* Form card */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-card p-7">
          <ListingForm
            initialData={initialData}
            onSubmit={handleSubmit}
            submitLabel="Save changes"
          />
        </div>
      </div>
    </div>
  );
}
