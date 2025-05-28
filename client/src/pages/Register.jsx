import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import Header from "@/pages/Header";  // Import the Header component
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { registerUser } from "@/services/api";

export default function Register() {
  const { register, handleSubmit } = useForm();
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    try {
      await registerUser(data);
      navigate("/login");
    } catch (err) {
      setError("Registration failed");
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-cover bg-center" 
             style={{ backgroundImage: 'url(../public/image.png)' }}>
      <Header />  {/* Add the Header component */}
      <div className="flex-grow flex items-center justify-center">
        <Card className="w-full max-w-lg shadow-lg">
          <CardHeader>
            <CardTitle className="text-center text-3xl font-bold">Register</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <Input placeholder="Name" {...register("name", { required: true })} className="h-12" />
              <Input placeholder="Email" {...register("email", { required: true })} className="h-12" />
              <Input type="password" placeholder="Password" {...register("password", { required: true })} className="h-12" />
              <Button type="submit" className="w-full h-12 text-lg">Register</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
