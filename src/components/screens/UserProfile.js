import React, { useEffect, useState, useContext } from 'react';
import '../styles/Profile.css';
import { faHeart, faCog, faComment } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { UserContext } from '../../App';
import { useParams } from 'react-router-dom';

export default function Profile() {
  const [userProfile, setProfile] = useState(null);
  const [showfollow, setShowFollow] = useState(true);
  const { state, dispatch } = useContext(UserContext);
  const { userid } = useParams();

  useEffect(() => {
    console.log(userid);
    fetch(`/user/${userid}`, {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('jwt'),
      },
    })
      .then((res) => res.json())
      .then((result) => {
        setProfile(result);
        state
          ? setShowFollow(!state.following.includes(userid))
          : setShowFollow(true);
      })
      .catch((e) => {
        console.log('error ', e);
      });
  }, []);
  const followUser = () => {
    fetch('/follow', {
      method: 'put',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + localStorage.getItem('jwt'),
      },
      body: JSON.stringify({
        followId: userid,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        dispatch({
          type: 'UPDATE',
          payload: { following: data.following, followers: data.followers },
        });
        localStorage.setItem('user', JSON.stringify(data));
        setProfile((prevState) => {
          return {
            ...prevState,
            user: {
              ...prevState.user,
              followers: [...prevState.user.followers, data._id],
            },
          };
        });
        setShowFollow(false);
      });
  };
  const unfollowUser = () => {
    fetch('/unfollow', {
      method: 'put',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + localStorage.getItem('jwt'),
      },
      body: JSON.stringify({
        unfollowId: userid,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        dispatch({
          type: 'UPDATE',
          payload: { following: data.following, followers: data.followers },
        });
        localStorage.setItem('user', JSON.stringify(data));
        setProfile((prevState) => {
          const newFollower = prevState.user.followers.filter(
            (item) => item != data._id
          );
          return {
            ...prevState,
            user: {
              ...prevState.user,
              followers: newFollower,
            },
          };
        });
        setShowFollow(true);
      });
  };
  return (
    <>
      {userProfile ? (
        <div className='all'>
          <div className='container'>
            <div className='profile'>
              <div className='profile-image'>
                <img className='pimg' src={userProfile.user.pic} alt='' />
              </div>

              <div className='profile-user-settings'>
                <h1 className='profile-user-name'>{userProfile.user.name}</h1>

                {/* <button className='btnp profile-edit-btnp'>Edit Profile</button>

                <button
                  className='btnp profile-settings-btnp'
                  aria-label='profile settings'
                >
                  <FontAwesomeIcon
                    icon={faCog}
                    aria-hidden='true'
                  ></FontAwesomeIcon>
                </button> */}
              </div>

              <div className='profile-stats'>
                <ul>
                  <li>
                    <span className='profile-stat-count'>
                      {userProfile.posts.length}{' '}
                    </span>
                    posts
                  </li>
                  <li>
                    <span className='profile-stat-count'>
                      {userProfile.user.followers.length}
                    </span>{' '}
                    followers
                  </li>
                  <li>
                    <span className='profile-stat-count'>
                      {userProfile.user.following.length}
                    </span>{' '}
                    following
                  </li>
                </ul>
              </div>

              {/* <div className='profile-bio'>
                <p>
                  <span className='profile-real-name'>Stonk Man</span> I am
                  Investor
                </p>
              </div> */}
              {showfollow ? (
                <button
                  className='editProfileButton'
                  onClick={() => followUser()}
                >
                  FOLLOW
                </button>
              ) : (
                <button
                  className='editProfileButton'
                  onClick={() => unfollowUser()}
                >
                  UNFOLLOW
                </button>
              )}
            </div>
          </div>
          <div className='container'>
            <div className='gallery'>
              {userProfile.posts.map((item, index) => (
                <div className='gallery-item' tabIndex='0' key={index}>
                  <img
                    className='pimg'
                    key={item._id}
                    src={item.photo}
                    className='gallery-image'
                    alt={item.title}
                  />

                  <div className='gallery-item-info'>
                    <ul>
                      <li className='gallery-item-likes'>
                        <span className='visually-hidden'>Likes:</span>
                        <FontAwesomeIcon
                          icon={faHeart}
                          aria-hidden='true'
                        ></FontAwesomeIcon>{' '}
                        1
                      </li>
                      <li className='gallery-item-comments'>
                        <span className='visually-hidden'>Comments:</span>
                        <FontAwesomeIcon
                          icon={faComment}
                          aria-hidden='true'
                        ></FontAwesomeIcon>{' '}
                        2
                      </li>
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className='loader'></div>
      )}
    </>
  );
}
