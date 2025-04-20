
import { useState } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

// Fake user data
const userData = {
  name: "Riya S.",
  email: "riya@example.com",
  bio: "Computer Science student passionate about design and technology. Looking for small gigs to improve my skills.",
  skills: ["UI/UX Design", "Graphic Design", "Adobe Photoshop"],
  joined: "December 2024",
  role: "client", // or "freelancer"
  completedGigs: 3,
  rating: 4.8,
};

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: userData.name,
    email: userData.email,
    bio: userData.bio,
    skills: userData.skills.join(", "),
  });
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // In a real app, this would update the user profile via API
    console.log("Updated profile:", formData);
    
    // Simulate API call success
    setTimeout(() => {
      setIsEditing(false);
    }, 500);
  };
  
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <h1 className="text-3xl font-bold">My Profile</h1>
            
            {!isEditing && (
              <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Sidebar */}
            <Card className="md:col-span-1">
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center">
                  <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-2xl mb-4">
                    {userData.name.charAt(0)}
                  </div>
                  
                  <h2 className="text-xl font-semibold">{userData.name}</h2>
                  <p className="text-muted-foreground mb-4">{userData.role === "client" ? "Client" : "Freelancer"}</p>
                  
                  <div className="flex items-center gap-1 text-sm mb-1">
                    <span className="text-yellow-500">★</span>
                    <span>{userData.rating}</span>
                    <span className="text-muted-foreground">({userData.completedGigs} gigs)</span>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-4">
                    Member since {userData.joined}
                  </p>
                  
                </div>
              </CardContent>
            </Card>
            
            {/* Main Content */}
            <div className="md:col-span-3">
              {isEditing ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Edit Profile</CardTitle>
                    <CardDescription>
                      Update your personal information
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleChange}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="bio">Bio</Label>
                        <Textarea
                          id="bio"
                          name="bio"
                          value={formData.bio}
                          onChange={handleChange}
                          rows={4}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="skills">Skills (comma separated)</Label>
                        <Input
                          id="skills"
                          name="skills"
                          value={formData.skills}
                          onChange={handleChange}
                        />
                      </div>
                      
                      <div className="flex gap-2">
                        <Button type="submit">Save Changes</Button>
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => setIsEditing(false)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              ) : (
                <Tabs defaultValue="profile">
                  <TabsList className="mb-6">
                    <TabsTrigger value="profile">Profile</TabsTrigger>
                    <TabsTrigger value="history">Gig History</TabsTrigger>
                    <TabsTrigger value="reviews">Reviews</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="profile">
                    <Card>
                      <CardHeader>
                        <CardTitle>About Me</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-foreground/90 mb-6">{userData.bio}</p>
                        
                        <h3 className="font-medium mb-3">Skills</h3>
                        <div className="flex flex-wrap gap-2 mb-6">
                          {userData.skills.map((skill, index) => (
                            <Badge key={index} variant="secondary">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                        
                        <h3 className="font-medium mb-3">Contact Information</h3>
                        <p className="text-foreground/90">
                          <span className="text-muted-foreground">Email: </span>
                          {userData.email}
                        </p>
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  <TabsContent value="history">
                    <Card>
                      <CardHeader>
                        <CardTitle>Gig History</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {userData.role === "client" ? (
                          <p>You've posted {userData.completedGigs} gigs so far.</p>
                        ) : (
                          <p>You've completed {userData.completedGigs} gigs with an average rating of {userData.rating}.</p>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  <TabsContent value="reviews">
                    <Card>
                      <CardHeader>
                        <CardTitle>Reviews</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-center py-4">
                          <p className="text-muted-foreground">
                            No reviews to show yet.
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
