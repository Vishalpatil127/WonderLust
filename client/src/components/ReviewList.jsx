import { Star, Trash2, Pencil } from "lucide-react";

function StarDisplay({ rating }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`w-3.5 h-3.5 ${
            s <= rating ? "fill-amber-400 text-amber-400" : "text-gray-200 fill-gray-200"
          }`}
        />
      ))}
    </div>
  );
}

export default function ReviewList({ reviews = [], currentUserId, onEdit, onDelete }) {
  if (!reviews.length) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mb-3">
          <Star className="w-6 h-6 text-gray-300" />
        </div>
        <p className="text-gray-600 font-medium">No reviews yet</p>
        <p className="text-sm text-gray-400 mt-1">Be the first to share your experience.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => {
        const isOwner =
          currentUserId &&
          String(review.user?._id || review.user) === String(currentUserId);

        return (
          <article
            key={review._id}
            className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-card transition-shadow"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-100 to-brand-50 flex items-center justify-center shrink-0">
                  <span className="text-sm font-bold text-brand uppercase">
                    {review.user?.username?.[0] || "G"}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {review.user?.username || "Guest"}
                  </p>
                  <p className="text-xs text-gray-400">
                    {new Date(review.createdAt).toLocaleDateString("en-IN", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>
              <StarDisplay rating={review.rating} />
            </div>

            <p className="mt-3 text-sm text-gray-600 leading-relaxed">{review.comment}</p>

            {review.images?.length > 0 && (
              <div className="flex gap-2 flex-wrap mt-3">
                {review.images.map((img) => (
                  <img
                    key={img}
                    src={img}
                    alt="Review"
                    className="w-20 h-16 object-cover rounded-xl border border-gray-100"
                  />
                ))}
              </div>
            )}

            {isOwner && (
              <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => onEdit(review)}
                  className="btn btn-ghost btn-sm text-xs gap-1.5"
                >
                  <Pencil className="w-3.5 h-3.5" /> Edit
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(review._id)}
                  className="btn btn-ghost btn-sm text-xs text-red-500 hover:bg-red-50 gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              </div>
            )}
          </article>
        );
      })}
    </div>
  );
}
