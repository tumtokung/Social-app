import React, { useContext } from 'react';
import '../styles/Home.css';
import Love from '../../assets/heart.png';
import LoveFilled from '../../assets/heart1.png';
import Delete from '../../assets/delete.png';
import { UserContext } from '../../App';
import { Link } from 'react-router-dom';
import M from 'materialize-css';
import Moment from 'moment';
export default function Home() {
  const [data, setData] = React.useState([]);
  const { state, dispatch } = useContext(UserContext);
  const [loader, setLoader] = React.useState(true);
  let Now = new Date(new Date().getTime() + 1000 * 60 * 60 * 7);
  React.useEffect(() => {
    // console.log(state);
    fetch('/allpost', {
      headers: {
        authorization: 'Bearer ' + localStorage.getItem('jwt'),
      },
    })
      .then((res) => res.json())
      .then((res) => {
        console.log(res.posts);
        setData(res.posts);
        setLoader(false);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);
  const likePost = (id) => {
    // e.preventDefault();
    fetch('/like', {
      method: 'put',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + localStorage.getItem('jwt'),
      },
      body: JSON.stringify({
        postId: id,
      }),
    })
      .then((res) => res.json())
      .then((result) => {
        const newData = data.map((item) => {
          if (item._id == result._id) {
            return result;
          } else {
            return item;
          }
        });
        console.log('data on like ', newData);
        setData(newData);
        // setLoader(false);
      })
      .catch((err) => {
        console.log(err);
      });
  };
  const unLikePost = (id) => {
    fetch('/unlike', {
      method: 'put',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + localStorage.getItem('jwt'),
      },
      body: JSON.stringify({
        postId: id,
      }),
    })
      .then((res) => res.json())
      .then((result) => {
        console.log('unlike');
        const newData = data.map((item) => {
          if (item._id == result._id) {
            return result;
          } else {
            return item;
          }
        });
        console.log('data on unlike ', newData);
        setData(newData);
        // setLoader(false);
      })
      .catch((err) => {
        console.log(err);
      });
  };
  const makeComment = (text, postId) => {
    if (!text) {
      M.toast({
        html: 'Comment must not empty',
        classes: '#c62828 red darken-3',
      });
      return;
    }
    fetch('/comment', {
      method: 'put',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + localStorage.getItem('jwt'),
      },
      body: JSON.stringify({
        postId,
        text,
      }),
    })
      .then((res) => res.json())
      .then((result) => {
        const newData = data.map((item) => {
          if (item._id == result._id) {
            console.log('comment : ', result);
            document.getElementById(item._id).value = ''; // {item._id}
            return result;
          } else {
            return item;
          }
        });
        console.log('Data comment ', newData);
        setData(newData);
        // document.getElementById('addsomecomment').value = ''; // {item._id}
        M.toast({
          html: 'Successfully Commented',
          classes: '#c62828 green darken-3',
        });
      })
      .catch((err) => {
        console.log(err);
      });
  };
  const deletePost = (postid) => {
    fetch(`/deletepost/${postid}`, {
      method: 'delete',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('jwt'),
      },
    })
      .then((res) => res.json())
      .then((result) => {
        console.log(result);
        const newData = data.filter((item) => {
          return item._id !== result._id;
        });
        setData(newData);
      });
  };
  return (
    <div className='home'>
      {loader === true ? (
        <div className='loader'></div>
      ) : data.length !== 0 ? (
        data.map((item, index) => {
          return (
            <>
              <div className='card home-card' key={index}>
                <div className='card-image'>
                  <img alt='postImg' src={item.photo} />
                </div>
                <div className='card-content'>
                  <div>
                    {item.likes.includes(state._id) ? (
                      <img
                        src={LoveFilled}
                        className='likeIcon'
                        alt='likeIconUnfilled'
                        onClick={() => {
                          // setLoader(true);
                          unLikePost(item._id);
                        }}
                      />
                    ) : (
                      <img
                        src={Love}
                        className='likeIcon'
                        alt='likeIconUnfilled'
                        onClick={() => {
                          // setLoader(true);
                          likePost(item._id);
                        }}
                      />
                    )}
                    {item.postedBy._id == state._id && (
                      <img
                        src={Delete}
                        className='likeIcon'
                        style={{ float: 'right' }}
                        onClick={() => deletePost(item._id)}
                      />
                    )}
                    <h6 style={{ marginTop: '5px' }}>
                      {item.likes.length}{' '}
                      {item.likes.length == 1 || item.likes.length == 0
                        ? 'like'
                        : 'likes'}
                    </h6>
                    <span
                      style={{
                        float: 'right',
                        fontSize: '14px',
                        color: 'rgb(187,187,187)',
                      }}
                    >
                      {Moment(item.datetime).from(Moment(Now))}
                    </span>
                  </div>
                  <div className='postOwner'>
                    <h6>
                      <Link
                        to={
                          item.postedBy._id !== state._id
                            ? '/profile/' + item.postedBy._id
                            : '/profile'
                        }
                        // to={'/profile/' + item.postedBy._id}
                        style={{
                          cursor: 'pointer',
                          fontWeight: '500',
                        }}
                      >
                        {item.postedBy.name}
                      </Link>

                      <span className='postBody'> {item.body}</span>
                    </h6>
                  </div>
                  <hr />
                  {item.comments.map((record) => {
                    return (
                      <h6 key={record._id}>
                        <span
                          style={{
                            fontWeight: '500',
                            fontSize: '14px',
                            cursor: 'pointer',
                          }}
                        >
                          <Link
                            to={
                              record.postedBy._id !== state._id
                                ? '/profile/' + record.postedBy._id
                                : '/profile/'
                            }
                          >
                            {record.postedBy.name}
                          </Link>
                        </span>{' '}
                        {'  '} {record.text}
                      </h6>
                    );
                  })}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      makeComment(e.target[0].value, item._id);
                    }}
                  >
                    <input
                      type='text'
                      // id='addsomecomment' // {item._id}
                      id={item._id}
                      placeholder='Add some comment'
                      autoComplete='off'
                    />
                  </form>
                </div>
              </div>
            </>
          );
        })
      ) : (
        <h1>There's no posts.</h1>
      )}
    </div>
  );
}
