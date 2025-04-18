import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  AuthError,
  AuthErrorCodes,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";

const signUpSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

const signInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const getAuthErrorMessage = (error: AuthError) => {
  switch (error.code) {
    case AuthErrorCodes.INVALID_PASSWORD:
      return "Incorrect password. Please try again.";
    case AuthErrorCodes.INVALID_EMAIL:
      return "Invalid email address format.";
    case AuthErrorCodes.USER_DELETED:
      return "No account found with this email. Please sign up first.";
    case AuthErrorCodes.EMAIL_EXISTS:
      return "An account already exists with this email. Please sign in instead.";
    case "auth/invalid-credential":
      return "Invalid email or password. Please check your credentials and try again.";
    case AuthErrorCodes.WEAK_PASSWORD:
      return "Password is too weak. It should be at least 6 characters long.";
    case AuthErrorCodes.NETWORK_REQUEST_FAILED:
      return "Network error. Please check your internet connection.";
    case AuthErrorCodes.TOO_MANY_ATTEMPTS_TRY_LATER:
      return "Too many failed attempts. Please try again later.";
    default:
      return "An error occurred. Please try again.";
  }
};

const Login = () => {
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState("");

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: zodResolver(isSignUp ? signUpSchema : signInSchema),
  });

  // Reset form when switching between sign in and sign up
  React.useEffect(() => {
    reset();
    setError("");
  }, [isSignUp, reset]);

  const onSubmit = async (data: any) => {
    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, data.email, data.password);
      } else {
        await signInWithEmailAndPassword(auth, data.email, data.password);
      }
      navigate("/");
    } catch (error: any) {
      setError(getAuthErrorMessage(error as AuthError));
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      navigate("/");
    } catch (error: any) {
      setError(getAuthErrorMessage(error as AuthError));
    }
  };

  return (
    <div className="min-h-screen pt-16 flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">
            {isSignUp ? "Create Account" : "Welcome Back"}
          </CardTitle>
          <CardDescription>
            {isSignUp ? "Sign up to start creating thumbnails" : "Login to access your thumbnails"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input
                type="email"
                {...register("email")}
                placeholder="Enter your email"
              />
              {errors.email && (
                <p className="text-red-500 text-sm">{errors.email.message as string}</p>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Password</label>
              <Input
                type="password"
                {...register("password")}
                placeholder="Enter your password"
              />
              {errors.password && (
                <p className="text-red-500 text-sm">{errors.password.message as string}</p>
              )}
            </div>
            {isSignUp && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Confirm Password</label>
                <Input
                  type="password"
                  {...register("confirmPassword")}
                  placeholder="Confirm your password"
                />
                {errors.confirmPassword && (
                  <p className="text-red-500 text-sm">{errors.confirmPassword.message as string}</p>
                )}
              </div>
            )}
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700">
              {isSignUp ? "Sign Up" : "Sign In"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleGoogleSignIn}
          >
            Continue with Google
          </Button>
          <p className="text-sm text-gray-600 text-center">
            {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
            <button
              type="button"
              className="text-purple-600 hover:text-purple-700"
              onClick={() => setIsSignUp(!isSignUp)}
            >
              {isSignUp ? "Sign in" : "Sign up"}
            </button>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;
