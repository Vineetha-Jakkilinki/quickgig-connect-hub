
import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import CategoryBadge from "@/components/ui/CategoryBadge";
import { Button } from "./ui/button";

interface GigCardProps {
  id: string;
  title: string;
  description: string;
  budget: number;
  deadline: string;
  category: string;
}

const GigCard = ({ id, title, description, budget, deadline, category }: GigCardProps) => {
  // Calculate days remaining
  const deadlineDate = new Date(deadline);
  const today = new Date();
  const daysRemaining = Math.ceil((deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  
  return (
    <Card className="gig-card overflow-hidden">
      <CardHeader className="p-4 pb-0">
        <div className="flex items-start justify-between">
          <CategoryBadge category={category} />
          <Badge variant="outline" className={`${daysRemaining <= 1 ? 'bg-orange-50 text-orange-600 border-orange-200' : ''}`}>
            {daysRemaining <= 0 ? 'Due today' : daysRemaining === 1 ? '1 day left' : `${daysRemaining} days left`}
          </Badge>
        </div>
        <Link to={`/gig/${id}`} className="mt-2 text-lg font-semibold hover:text-primary transition-colors line-clamp-2">
          {title}
        </Link>
      </CardHeader>
      <CardContent className="p-4">
        <p className="text-muted-foreground line-clamp-2 text-sm">
          {description}
        </p>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex justify-between items-center">
        <div className="font-semibold text-lg">₹{budget}</div>
        <Link to={`/gig/${id}`}>
          <Button variant="outline" size="sm">View Details</Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

export default GigCard;
