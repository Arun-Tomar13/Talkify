import {axiosInstance} from "./axios";

export const signup = async(signupData)=>{
      const response = await axiosInstance.post("/auth/signup",signupData);
      return response.data;
}

export const getAuthUser = async ()=>{
      try {
            const res = await axiosInstance.get("/auth/me");
            return res.data;
      } catch (error) {
            console.log("user is not authenticated",error);
            return null;
      }
    }

export const login = async (logindata)=>{
      const res = await axiosInstance.post("/auth/login",logindata);
      return res.data;
    }

export const logout = async ()=>{
      const res = await axiosInstance.post("/auth/logout");
      return res.data;
    }

export const completeOnboarding = async (userdata)=>{
      const response = await axiosInstance.post("/auth/onboarding",userdata);
      return response.user;   
}   