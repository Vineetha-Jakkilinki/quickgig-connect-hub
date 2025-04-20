
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import GigCard from "@/components/GigCard";
import Layout from "@/components/Layout";

// Demo data for featured gigs
const featuredGigs = [
  {
    id: "1",
    title: "Need a YouTube Thumbnail for my Study Vlog",
    description: "I want a clean, modern thumbnail with bold fonts. Use my picture. Text should be: 'How I Study for Exams'.",
    budget: 150,
    deadline: "2025-05-01",
    category: "Design"
  },
  {
    id: "2",
    title: "Help with Python Script for Data Analysis",
    description: "I need a simple script to analyze CSV data for my statistics project. Must have visualizations.",
    budget: 200,
    deadline: "2025-04-25",
    category: "Code"
  },
  {
    id: "3",
    title: "Proofread my English Essay (5 pages)",
    description: "Looking for someone to check grammar, punctuation and improve the flow of my essay on climate change.",
    budget: 100,
    deadline: "2025-04-23",
    category: "Docs"
  }
];

// Categories with icons
const categories = [
  { name: "Design", icon: "🎨", description: "Logos, Thumbnails, Graphics" },
  { name: "Code", icon: "💻", description: "Scripts, Bug Fixes, Features" },
  { name: "Docs", icon: "📝", description: "Essays, Resumes, Proofreading" }
];

// How it works steps
const steps = [
  { 
    number: 1, 
    title: "Post Your Gig", 
    description: "Describe what you need, set your budget and deadline."
  },
  { 
    number: 2, 
    title: "Get Applications", 
    description: "Review applications from skilled student freelancers."
  },
  { 
    number: 3, 
    title: "Choose & Pay", 
    description: "Pick the best fit, only pay when you're satisfied."
  }
];

const Home = () => {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 md:py-28">
        <div className="absolute inset-0 hero-gradient opacity-10"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-balance mb-6">
              Find or Offer Micro-Jobs Starting at <span className="text-primary">₹50</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 text-balance">
              Students helping students — fast, affordable gigs for design, docs, and code.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/browse">
                <Button size="lg" className="w-full sm:w-auto">
                  Find Gigs
                </Button>
              </Link>
              <Link to="/post">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  Post a Gig
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
      
      {/* Categories Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Browse by Category</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {categories.map((category) => (
              <Link 
                key={category.name} 
                to={`/browse?category=${category.name.toLowerCase()}`}
                className="bg-background rounded-lg p-8 text-center shadow-sm hover:shadow-md transition-shadow border border-border"
              >
                <div className="text-4xl mb-4">{category.icon}</div>
                <h3 className="text-xl font-medium mb-2">{category.name}</h3>
                <p className="text-muted-foreground">{category.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
      
      {/* Featured Gigs Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">Featured Gigs</h2>
            <Link to="/browse">
              <Button variant="ghost">View All</Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredGigs.map((gig) => (
              <GigCard key={gig.id} {...gig} />
            ))}
          </div>
        </div>
      </section>
      
      {/* How It Works Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step) => (
              <div key={step.number} className="relative">
                <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-4 text-primary font-bold">
                  {step.number}
                </div>
                <h3 className="text-xl font-medium mb-2">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
            Join thousands of students who are earning and getting help on QuickGig.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                Sign Up Now
              </Button>
            </Link>
            <Link to="/browse">
              <Button size="lg" variant="outline" className="w-full sm:w-auto bg-transparent border-white hover:bg-white/10">
                Browse Gigs
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Home;
