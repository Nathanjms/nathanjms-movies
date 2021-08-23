/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from "react";
import MyWatchList from "./MyWatchList";
import RandomMoviePicker from "./RandomMoviePicker";
import { useHistory } from "react-router-dom";
import { Alert, Tabs, Tab, Button } from "react-bootstrap";
import { findIndex, cloneDeep } from "lodash";
import MovieFormModal from "./MovieFormModal";
import AboutMovies from "./AboutMovies";
import Footer from "../Global/Footer";
import {
  AuthenticatedRequest,
  FormatResponseError,
} from "../Global/apiCommunication";

export default function Movies({ currentUser }) {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [seenMoviesList, setMySeenMovies] = useState([]);
  const [unseenMoviesList, setMyUnseenMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);
  const [userInfo, setUserInfo] = useState(false);
  const history = useHistory();

  const getUserInfo = async () => {
    setLoading(true);
    try {
      const result = await AuthenticatedRequest(currentUser).post(
        "/api/movies/user-info"
      );
      setUserInfo(result.data);
    } catch (err) {
      setError(FormatResponseError(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(async () => {
    await getUserInfo();
  }, []);

  useEffect(() => {
    if (userInfo?.group_id > 0) {
      getAllMovies(userInfo.group_id);
    }
  }, [userInfo]);

  const getAllMovies = async (userGroupId) => {
    setLoading(true);
    try {
      const resultSeen = await AuthenticatedRequest(currentUser).get(
        `/api/movies/${userGroupId}/group?isSeen=1&perPage=6`
      );
      const resultUnseen = await AuthenticatedRequest(currentUser).get(
        `/api/movies/${userGroupId}/group?isSeen=0&perPage=6`
      );

      setMySeenMovies(resultSeen.data);
      setMyUnseenMovies(resultUnseen.data);
    } catch (err) {
      setError(FormatResponseError(err));
    }
    setLoading(false);
  };

  const markAsSeen = async (movieId) => {
    try {
      setError("");
      setSuccess("");
      await AuthenticatedRequest(currentUser).put("/api/movies/mark-as-seen", {
        movieId: movieId,
      });
      var moviesArray = unseenMoviesList.data;
      let movieIndex = findIndex(moviesArray, {
        id: movieId,
      });
      setSuccess(`Movie "${moviesArray[movieIndex]["title"]}" marked as seen!`);
      setNewMovieLists(moviesArray, movieIndex);
    } catch (err) {
      setError(FormatResponseError(err));
    }
  };

  const setNewMovieLists = (moviesArray, movieIndex) => {
    let tempMovieList;
    tempMovieList = cloneDeep(unseenMoviesList);
    tempMovieList.data.splice(movieIndex, 1);
    setMyUnseenMovies(tempMovieList);
    tempMovieList = cloneDeep(seenMoviesList);
    tempMovieList.data.push(moviesArray[movieIndex]);
    setMySeenMovies(tempMovieList);
  }

  async function handleLogout() {
    setError("");
    localStorage.clear();
    try {
      await AuthenticatedRequest(currentUser).post("/api/logout");
    } catch (err) {
    } finally {
      history.push("/login");
    }
  }

  return (
    <>
      <div className="container" id="movies">
        <div className="row">
          <div className="col-lg-12 mt-4">
            <Button
              variant="link"
              className="topBtn"
              style={{ float: "right" }}
              onClick={handleLogout}
            >
              Log Out
            </Button>
          </div>
          <div className="col-lg-12">
            <h5 className="text-center">
              <a href="https://www.nathanjms.co.uk">www.nathanjms.co.uk</a>
            </h5>
            <h1 className="text-center">Movies</h1>
          </div>
          <div className="col-lg-12 pb-4">
            <h5 className="text-center pt-5">
              Name: {loading ? "Loading..." : `${userInfo.user_name}`}
            </h5>
            <h5 className="text-center">
              Group: {loading ? "Loading..." : `${userInfo.group_name}`}
            </h5>
          </div>
          {error && (
            <Alert className="w-100" variant="danger">
              {error}
            </Alert>
          )}
          {success && (
            <Alert className="w-100" variant="success">
              {success}
            </Alert>
          )}
        </div>
        <Tabs defaultActiveKey="movies-list" id="tabs">
          <Tab eventKey="movies-list" title="My Watch List">
            <Button
              variant="primary"
              className="mt-3"
              onClick={() => setShow(true)}
            >
              Add a new Film!
            </Button>

            <MyWatchList
              loading={loading}
              markAsSeen={markAsSeen}
              movies={unseenMoviesList}
              seen={false}
            />
          </Tab>
          <Tab eventKey="watched-movies-list" title="My Watched Movies">
            <MyWatchList
              loading={loading}
              markAsSeen={markAsSeen}
              movies={seenMoviesList}
              seen={true}
            />
          </Tab>
          <Tab eventKey="random-movie-picker" title="Random Movie Picker">
            <RandomMoviePicker movies={unseenMoviesList} />
          </Tab>
          <Tab eventKey="about" title="About">
            <AboutMovies />
          </Tab>
          {/* <Tab eventKey="imdb" title="IMDB Top Movies"></Tab>
        <Tab eventKey="watched-imdb" title="IMDB Watched Movies"></Tab> */}
        </Tabs>
        <MovieFormModal
          handleClose={() => setShow(false)}
          show={show}
          setError={setError}
          setSuccess={setSuccess}
          request={AuthenticatedRequest(currentUser)}
          moviesList={unseenMoviesList}
          groupId={userInfo.group_id}
          FormatResponseError={FormatResponseError}
          setMyUnseenMovies={setMyUnseenMovies}
        />
      </div>
      <footer id="footer">
        <Footer />
      </footer>
    </>
  );
}
