import React from "react";
import { motion } from "framer-motion";
import { Star } from "lucide-react";

const StarRating = ({ rating, setRating, maxStars = 5, size = "md", readonly = false }) => {
    const sizes = {
        sm: { star: 16, gap: 1 },
        md: { star: 24, gap: 2 },
        lg: { star: 32, gap: 3 },
    };

    const { star: starSize, gap } = sizes[size] || sizes.md;

    const handleClick = (value) => {
        if (readonly) return;
        setRating(rating === value ? null : value);
    };

    return (
        <div className={`flex items-center gap-${gap}`}>
            {[...Array(maxStars)].map((_, index) => {
                const value = index + 1;
                const isFilled = rating && value <= rating;

                return (
                    <motion.button
                        key={index}
                        type="button"
                        onClick={() => handleClick(value)}
                        whileHover={!readonly ? { scale: 1.2 } : {}}
                        whileTap={!readonly ? { scale: 0.9 } : {}}
                        disabled={readonly}
                        className={`focus:outline-none transition-colors ${readonly ? "cursor-default" : "cursor-pointer"}`}
                    >
                        <Star
                            size={starSize}
                            className={`transition-colors ${isFilled
                                ? "fill-yellow-400 text-yellow-400"
                                : "fill-transparent text-gray-300 dark:text-gray-600"
                                } ${!readonly && "hover:text-yellow-400"}`}
                        />
                    </motion.button>
                );
            })}
            {rating && (
                <span className="ml-2 text-sm font-medium text-gray-600 dark:text-gray-400">
                    {rating}/{maxStars}
                </span>
            )}
        </div>
    );
};

export const DisplayRating = ({ rating, maxStars = 5, size = "sm" }) => {
    const sizes = {
        sm: 14,
        md: 18,
        lg: 24,
    };
    const starSize = sizes[size] || sizes.sm;

    if (!rating) return null;

    return (
        <div className="flex items-center gap-1">
            {[...Array(maxStars)].map((_, index) => (
                <Star
                    key={index}
                    size={starSize}
                    className={`${index < rating
                        ? "fill-yellow-400 text-yellow-400"
                        : "fill-transparent text-gray-300 dark:text-gray-600"
                        }`}
                />
            ))}
            <span className="ml-1 text-sm font-medium text-gray-600 dark:text-gray-400">
                {rating}
            </span>
        </div>
    );
};

export default StarRating;
