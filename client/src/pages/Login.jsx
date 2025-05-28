import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import Header from "@/pages/Header";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { loginUser } from "@/services/api";

export default function Login() {
  const { register, handleSubmit } = useForm();
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { user, setUser, loading } = useAuth();

  // Check if already logged in
  useEffect(() => {
    if (!loading && user) {
      navigate("/dashboard");
    }
  }, [user, loading, navigate]);

  const onSubmit = async (data) => {
    try {
      const response = await loginUser(data);
      localStorage.setItem("token", response.data.token);
      
      // Update the user in context
      if (response.data.user) {
        setUser(response.data.user);
      }
      
      navigate("/dashboard");
    } catch (err) {
      setError("Invalid email or password");
    }
  };

  // If still loading auth state, show loading indicator
  if (loading) {
    return (
     <div className="flex flex-col min-h-screen bg-cover bg-center" 
             style={{ backgroundImage: 'url(./image.jpg), linear-gradient(to right, rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.6))' }}>
        <Header />
        <div className="flex-grow flex items-center justify-center">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-cover bg-center" 
             style={{ backgroundImage: 'url(../public/image.png)' }}>
      <Header />
      <div className="flex-grow flex items-center justify-center">
        <Card className="w-full max-w-lg shadow-lg">
          <CardHeader>
            <CardTitle className="text-center text-3xl font-bold">Login</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <Input placeholder="Email" {...register("email", { required: true })} className="h-12" />
              <Input type="password" placeholder="Password" {...register("password", { required: true })} className="h-12" />
              <Button type="submit" className="w-full h-12 text-lg">Login</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
