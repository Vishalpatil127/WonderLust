import { useNavigate } from "react-router-dom";
import { PlusCircle } from "lucide-react";
import api from "../api/axios";
import ListingForm from "../components/ListingForm";

export default function NewListing() {
  const navigate = useNavigate();

  const handleSubmit = async (data) => {
    const res = await api.post("/listings", data);
    navigate(`/listings/${res.data.listing._id}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="page-container max-w-2xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center">
            <PlusCircle className="w-5 h-5 text-brand" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">Create a listing</h1>
            <p className="text-sm text-gray-400">Share your space with travellers worldwide</p>
          </div>
        </div>

        {/* Form card */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-card p-7">
          <ListingForm onSubmit={handleSubmit} submitLabel="Publish listing" />
        </div>
      </div>
    </div>
  );
}
