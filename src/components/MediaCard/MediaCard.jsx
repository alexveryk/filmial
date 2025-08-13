export const MediaCard = ({items})=>{

    const reliseDate = (date) => {
        const [year, month, day] = date.split("-")
        return `${day}.${month}.${year}`
    }
 
    return(
         <div className="max-w-3xs rounded-lg overflow-hidden shadow-lg">
            {console.log("Card: ", items)}
                <img
                  className="w-full h-96 object-cover"
                  src={`https://image.tmdb.org/t/p/original/${items.poster_path}`}
                  alt="Movie Poster"
                />
              </div>
    )
}