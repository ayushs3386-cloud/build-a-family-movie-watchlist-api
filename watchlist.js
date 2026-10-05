import express from "express";
import { findByUsername, findById ,getWatchlist,addMovie,updateMovie,deleteMovie} from "../utils/db.js";
import bcrypt from "bcryptjs";
import { signToken } from "../utils/jwt.js";
import {authenticate} from "../middleware/authenticate.js";
import {authorizeModification} from "../middleware/authorize.js"
const router = express.Router();
export default router;


router.post("/api/auth/login", async (req,res,next)=> {
    const { username , password } = req.body;
    if (!username || !password) {
        return res.status(400).json({message: "usename and password are required"});
    } 
    const user = findByUsername(username);
    if (!user) {
        return res.status(401).json({"error": "Invalid Credentials."});
    }
    const isCorrectPassword = await bcrypt.compare(password,user.passwordHash);
    
    if (!isCorrectPassword) {
        return res.status(401).json({"error": "Invalid Credentials."});
    }
     const token = signToken({username: user.username,role:user.role,id: user.id});
    res.status(200).json({token})

})

router.get("/api/watchlist/:userId",authenticate,(req,res,next)=> {
    const {userId} = req.params;
    const watchlist = getWatchlist(Number(userId));
    return res.status(200).json({message: "success",watchlist});
    
})

router.post("/api/watchlist/:userId/movies",authenticate,authorizeModification,(req,res,next)=> {
    const {userId} = req.params;
    const movieData = req.body.movieData || req.body;
    
        addMovie(Number(userId),movieData);
    
        res.status(201).json({message: "Movie added succesfully to your watchlist."})

    

})

router.put("/api/watchlist/:userId/movies/:movieId",authenticate,authorizeModification,(req,res)=> {

    const {userId, movieId} = req.params;
    const {movieData}  = req.body;
    const user = findById(req.user.id);
    if (user.role === "parent") {
        updateMovie(Number(userId),Number(movieId),movieData);
        return res.status(200).json({message:"movie updated succefully in your watchlist"});

    }
    if (user.role === "child") {
        if (user.id !== Number(userId)) {
            return res.status(403).json({message: "permission denied"});
        }
        updateMovie(Number(userId),Number(movieId),movieData);
        return res.status(200).json({message:"movie updated succesfuly"});
    }

})

router.delete("/api/watchlist/:userId/movies/:movieId",authenticate,authorizeModification, (req,res)=> {
    const {userId , movieId} = req.params;

    const user = findById(req.user.id);

    if (user.role === "parent") {
        deleteMovie(Number(userId),Number(movieId));
        return res.status(200).json({message: "movie successfully removed from your watchlist"});
    }
    if (user.role === "child") {
        if (user.id !== Number(userId)) {
            return res.status(403).json({message: "Access Denied"});

        }
        deleteMovie(Number(userId),Number(movieId));
        return res.status(200).json({message: "movie succesfully removed from your watchlist"});
    }
})
