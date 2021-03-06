import React from "react";
import { Card, Button } from "react-bootstrap";
import StarRatings from "./StarRatings";

export default function MyWatchList({
  movies,
  markAsSeen,
  seen,
  getNewMoviePage,
  request,
  demo = false,
}) {
  var moviesArray = movies;
  var nextPageUrl = true;
  var prevPageUrl = true;
  if (!demo) {
    moviesArray = movies?.data ? movies.data : [];
    nextPageUrl = movies?.next_page_url ? movies.next_page_url : false;
    prevPageUrl = movies?.prev_page_url ? movies.prev_page_url : false;
  }

  const handleMoreResults = (newPageUrl) => {
    getNewMoviePage(newPageUrl, seen);
  };

  return (
    <div className="row">
      <div className="col-lg-12 pt-3">
        <h3 className="text-center pb-5">My Watchlist</h3>
      </div>
      <div className="col-lg-12 d-flex justify-content-center">
        <div className="w-100 text-center mt-2 row justify-content-center">
          {moviesArray.length === 0 && (
            <div className="col-lg-12">
              <h3>You've not added any movies yet!</h3>
            </div>
          )}
          {moviesArray.map((movie, index) => {
            return (
              <div key={movie.id} className="col-sm-6 col-lg-3 mb-5">
                <Card.Body className="h-100">
                  <p>{movie.title}</p>
                  {!seen && (
                    <Button
                      disabled={movie.seen}
                      onClick={() => markAsSeen(movie.id)}
                    >
                      Seen It!
                    </Button>
                  )}
                  {seen && (
                    <StarRatings
                      movieId={movie.id}
                      movieRating={movie.rating ?? 0}
                      request={request}
                      demo={demo}
                    />
                  )}
                </Card.Body>
              </div>
            );
          })}
          <div className="col-lg-12">
            {nextPageUrl && (
              <Button
                disabled={!nextPageUrl}
                onClick={() => handleMoreResults(nextPageUrl)}
                style={{ float: "right" }}
              >
                Next Page
              </Button>
            )}
            {prevPageUrl && (
              <Button
                disabled={!prevPageUrl}
                onClick={() => handleMoreResults(prevPageUrl)}
                style={{ float: "left" }}
              >
                Previous Page
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
