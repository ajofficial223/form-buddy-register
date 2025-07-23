import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, UserPlus, CheckCircle } from "lucide-react";

interface FormData {
  fullName: string;
  guardianName: string;
  classGrade: string;
  language: string;
  location: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const RegistrationForm = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    guardianName: "",
    classGrade: "",
    language: "",
    location: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [webhookResponse, setWebhookResponse] = useState<string>("");

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};

    if (!formData.fullName.trim()) newErrors.fullName = "Full name is required";
    if (!formData.guardianName.trim()) newErrors.guardianName = "Guardian name is required";
    if (!formData.classGrade) newErrors.classGrade = "Class/Grade is required";
    if (!formData.language) newErrors.language = "Language is required";
    if (!formData.location.trim()) newErrors.location = "Location is required";
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = "Email address is required";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors in the form",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Create URL with query parameters for GET request
      const params = new URLSearchParams({
        fullName: formData.fullName,
        guardianName: formData.guardianName,
        classGrade: formData.classGrade,
        language: formData.language,
        location: formData.location,
        email: formData.email,
        password: formData.password,
        timestamp: new Date().toISOString()
      });
      
      const response = await fetch(`https://aviadigitalmind.app.n8n.cloud/webhook/AI-BUDDY-MAIN?${params}`, {
        method: "GET"
      });

      if (response.ok) {
        const responseText = await response.text();
        setWebhookResponse(responseText);
        
        toast({
          title: "Registration Successful!",
          description: "Your account has been created successfully.",
          action: <CheckCircle className="h-4 w-4" />
        });
        
        // Reset form
        setFormData({
          fullName: "",
          guardianName: "",
          classGrade: "",
          language: "",
          location: "",
          email: "",
          password: "",
          confirmPassword: ""
        });
      } else {
        const errorText = await response.text();
        setWebhookResponse(`Error: ${errorText}`);
        throw new Error("Registration failed");
      }
    } catch (error) {
      toast({
        title: "Registration Failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-primary flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-form border-0 bg-card/95 backdrop-blur-sm">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Create Account
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Join AI Buddy and start your learning journey
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                type="text"
                value={formData.fullName}
                onChange={(e) => handleInputChange("fullName", e.target.value)}
                className={`transition-all duration-300 focus:ring-2 focus:ring-primary/20 ${
                  errors.fullName ? "border-destructive" : ""
                }`}
                placeholder="Enter your full name"
              />
              {errors.fullName && <p className="text-sm text-destructive">{errors.fullName}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="guardianName">Guardian Name</Label>
              <Input
                id="guardianName"
                type="text"
                value={formData.guardianName}
                onChange={(e) => handleInputChange("guardianName", e.target.value)}
                className={`transition-all duration-300 focus:ring-2 focus:ring-primary/20 ${
                  errors.guardianName ? "border-destructive" : ""
                }`}
                placeholder="Enter guardian's name"
              />
              {errors.guardianName && <p className="text-sm text-destructive">{errors.guardianName}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="classGrade">Class/Grade</Label>
              <Select value={formData.classGrade} onValueChange={(value) => handleInputChange("classGrade", value)}>
                <SelectTrigger className={`transition-all duration-300 focus:ring-2 focus:ring-primary/20 ${
                  errors.classGrade ? "border-destructive" : ""
                }`}>
                  <SelectValue placeholder="Select your class/grade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="kindergarten">Kindergarten</SelectItem>
                  <SelectItem value="grade-1">Grade 1</SelectItem>
                  <SelectItem value="grade-2">Grade 2</SelectItem>
                  <SelectItem value="grade-3">Grade 3</SelectItem>
                  <SelectItem value="grade-4">Grade 4</SelectItem>
                  <SelectItem value="grade-5">Grade 5</SelectItem>
                  <SelectItem value="grade-6">Grade 6</SelectItem>
                  <SelectItem value="grade-7">Grade 7</SelectItem>
                  <SelectItem value="grade-8">Grade 8</SelectItem>
                  <SelectItem value="grade-9">Grade 9</SelectItem>
                  <SelectItem value="grade-10">Grade 10</SelectItem>
                  <SelectItem value="grade-11">Grade 11</SelectItem>
                  <SelectItem value="grade-12">Grade 12</SelectItem>
                </SelectContent>
              </Select>
              {errors.classGrade && <p className="text-sm text-destructive">{errors.classGrade}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="language">Language</Label>
              <Select value={formData.language} onValueChange={(value) => handleInputChange("language", value)}>
                <SelectTrigger className={`transition-all duration-300 focus:ring-2 focus:ring-primary/20 ${
                  errors.language ? "border-destructive" : ""
                }`}>
                  <SelectValue placeholder="Select your preferred language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="english">English</SelectItem>
                  <SelectItem value="spanish">Spanish</SelectItem>
                  <SelectItem value="french">French</SelectItem>
                  <SelectItem value="german">German</SelectItem>
                  <SelectItem value="mandarin">Mandarin</SelectItem>
                  <SelectItem value="hindi">Hindi</SelectItem>
                  <SelectItem value="arabic">Arabic</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              {errors.language && <p className="text-sm text-destructive">{errors.language}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                type="text"
                value={formData.location}
                onChange={(e) => handleInputChange("location", e.target.value)}
                className={`transition-all duration-300 focus:ring-2 focus:ring-primary/20 ${
                  errors.location ? "border-destructive" : ""
                }`}
                placeholder="Enter your city or country"
              />
              {errors.location && <p className="text-sm text-destructive">{errors.location}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className={`transition-all duration-300 focus:ring-2 focus:ring-primary/20 ${
                  errors.email ? "border-destructive" : ""
                }`}
                placeholder="Enter your email address"
              />
              {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                className={`transition-all duration-300 focus:ring-2 focus:ring-primary/20 ${
                  errors.password ? "border-destructive" : ""
                }`}
                placeholder="Create a password"
              />
              {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                className={`transition-all duration-300 focus:ring-2 focus:ring-primary/20 ${
                  errors.confirmPassword ? "border-destructive" : ""
                }`}
                placeholder="Confirm your password"
              />
              {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword}</p>}
            </div>

            <Button 
              type="submit" 
              className="w-full bg-gradient-primary hover:opacity-90 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Registering...
                </>
              ) : (
                <>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Register
                </>
              )}
            </Button>
          </form>
          
          {webhookResponse && (
            <div className="mt-6 p-4 bg-secondary/50 rounded-lg border">
              <h3 className="text-sm font-medium text-foreground mb-2">Webhook Response:</h3>
              <pre className="text-xs text-muted-foreground whitespace-pre-wrap break-words">{webhookResponse}</pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default RegistrationForm;