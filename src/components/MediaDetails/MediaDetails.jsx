import { useParams } from "react-router-dom"
import { fetchMovieDetails } from "../../services/api"
import { useEffect, useState } from "react"

export const MediaDetails = () => {
    const [MovieDetails, setMovieDetails] =useState([])

    const {movieId} = useParams()

    useEffect(()=>{
        const getMovieDetails = async () => {
        const data = await fetchMovieDetails(movieId);  
            if (data) {
            setMovieDetails(data);
            }      
        }
        getMovieDetails()
    }, [movieId])

    
    
    console.log(MovieDetails)
  
    return (
        <p>Details about movie or serails</p>
    )
}