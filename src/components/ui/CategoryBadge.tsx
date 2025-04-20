
import { cn } from "@/lib/utils";

interface CategoryBadgeProps {
  category: string;
  className?: string;
}

const CategoryBadge = ({ category, className }: CategoryBadgeProps) => {
  const getColorsByCategory = (category: string) => {
    switch (category.toLowerCase()) {
      case "design":
        return "bg-royal-100 text-royal-600";
      case "code":
        return "bg-teal-100 text-teal-600";
      case "docs":
        return "bg-orange-100 text-orange-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  return (
    <span 
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
        getColorsByCategory(category),
        className
      )}
    >
      {category}
    </span>
  );
};

export default CategoryBadge;
