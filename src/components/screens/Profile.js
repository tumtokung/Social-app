import React, { useEffect, useState, useContext } from 'react';
import '../styles/Profile.css';
import { faHeart, faCog, faComment } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { UserContext } from '../../App';
import M from 'materialize-css';
import Close from '../../assets/close.png';

const Modal = ({
  handleImg,
  imgForSend,
  setloading,
  loading,
  imgUrl,
  update,
  handleClose,
  imgSrc,
  setImgSrc,
  name,
  setName,
}) => {
  return (
    <div className='modalBox'>
      <div className='editProfileModal'>
        <div className='modalTitle'>Edit your profile</div>
        <div className='modalContent'>Profile name</div>
        <input
          className='editProfileName'
          type='text'
          value={name}
          placeholder='Name as your desire'
          onChange={(e) => {
            setName(e.target.value);
          }}
        />
        <div className='modalContent'>Profile image</div>
        <div className='file-field input-field'>
          <div
            className='btn #ffd145 yellow darken-1'
            style={{
              borderRadius: '1vh',
              color: 'white',
              padding: '0.2vh',
              paddingLeft: '1vh',
              paddingRight: '1vh',
            }}
          >
            <span>Upload</span>
            <input
              id='editprofileimage'
              type='file'
              onChange={(e) => {
                if (e.target.files.length !== 0) {
                  handleImg(e.target.files[0]);
                  setImgSrc(URL.createObjectURL(e.target.files[0]));
                }
              }}
            />
          </div>

          <div className='file-path-wrapper'>
            <input
              className='file-path validate'
              id='editprofileimage'
              type='text'
            />
          </div>
        </div>

        <p className='modalTitle'>Preview : </p>
        {imgSrc ? (
          <>
            <img src={imgSrc} classname='imgPreview' />
            <div
              style={{ width: '32px', height: '32px' }}
              onClick={() => {
                setImgSrc('');
                handleImg('');
                document.getElementById('editprofileimage').value = '';
              }}
            >
              <img src={Close} style={{ width: '32px', height: '32px' }} />
            </div>
          </>
        ) : null}
        <div className='modalButtonLayout'>
          <button
            className='modal-btn-cancel'
            onClick={() => {
              handleClose(false);
              setImgSrc('');
            }}
          >
            Cancel
          </button>
          <button
            className='modal-btn-submit'
            onClick={() => {
              setloading(true);
              update();
            }}
          >
            Update
          </button>
        </div>

        {loading ? (
          <div className='loaderBox'>
            <div className='loader' />
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default function Profile() {
  const [mypics, setPics] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const { state, dispatch } = useContext(UserContext);
  const [image, setImage] = useState('');
  const [imgLoading, setImgLoading] = useState(false);
  const [imgUrl, setImgUrl] = useState('');
  const [imgSrc, setImgSrc] = useState('');
  const [name, setName] = useState('');
  useEffect(() => {
    fetch('/myposts', {
      method: 'get',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('jwt'),
      },
    })
      .then((res) => res.json())
      .then((result) => {
        console.log(result.mypost);
        setPics(result.mypost);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);
  const updateProfile = () => {
    console.log('update only image', image);
    if (image) {
      const data = new FormData();
      data.append('file', image);
      data.append('upload_preset', 'Kaidow-Story');
      data.append('cloud_name', 'di8adkw2c');
      fetch('https://api.cloudinary.com/v1_1/di8adkw2c/image/upload', {
        method: 'post',
        body: data,
      })
        .then((res) => res.json())
        .then((data) => {
          setImgLoading(false);
          if (data.error) {
            M.toast({
              html: 'Error occurred while uploading image. Please try again.',
              classes: '#c62828 red darken-3',
            });
            setImage('');
            document.getElementById('editprofileimage').value = '';
          } else {
            fetch('/updatepic', {
              method: 'put',
              headers: {
                'Content-Type': 'application/json',
                Authorization: 'Bearer ' + localStorage.getItem('jwt'),
              },
              body: JSON.stringify({
                pic: data.url,
              }),
            })
              .then((res) => res.json())
              .then((result) => {
                localStorage.setItem(
                  'user',
                  JSON.stringify({ ...state, pic: result.pic })
                );
                dispatch({ type: 'UPDATEPIC', payload: result.pic });
                M.toast({
                  html: 'Update profile image successfully.',
                  classes: '#43a047 green darken-1',
                });
                setImgLoading(false);
                setOpenDialog(false);
              });
          }
        })
        .catch((err) => {
          console.log(err);
        });
    }
    if (name) {
      console.log('update only name', name);
      fetch('/updateName', {
        method: 'put',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + localStorage.getItem('jwt'),
        },
        body: JSON.stringify({
          name: name,
        }),
      })
        .then((res) => res.json())
        .then((result) => {
          localStorage.setItem(
            'user',
            JSON.stringify({ ...state, name: result.name })
          );
          dispatch({ type: 'UPDATENAME', payload: result.name });

          M.toast({
            html: 'Updated your profile successfully',
            classes: '#43a047 green darken-1',
          });
          setImgLoading(false);
          setOpenDialog(false);
          setName('');
        })
        .catch((err) => {
          M.toast({
            html: 'Error occurred while updating your profile. Please try again.',
          });
          setImgLoading(false);
        });
    }
    if (!name && !image) {
      setImgLoading(false);
      M.toast({
        html: 'Edit profile must not empty',
        classes: '#c62828 red darken-3',
      });
    }
  };

  return (
    <>
      {state ? (
        <div className='all'>
          <div className='container'>
            <div className='profile'>
              <div className='profile-image'>
                <img className='pimg' src={state.pic} alt='profileIMG' />
              </div>

              <div className='profile-user-settings'>
                <h1 className='profile-user-name'>{state.name}</h1>

                <button
                  className='editProfileButton'
                  onClick={() => {
                    setOpenDialog(true);
                  }}
                >
                  Edit Profile
                </button>
                {openDialog ? (
                  <Modal
                    handleImg={setImage}
                    imgForSend={image}
                    setloading={setImgLoading}
                    loading={imgLoading}
                    imgUrl={imgUrl}
                    update={updateProfile}
                    handleClose={setOpenDialog}
                    imgSrc={imgSrc}
                    setImgSrc={setImgSrc}
                    name={name}
                    setName={setName}
                  />
                ) : null}
                {/* <button
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
                    <span className='profile-stat-count'>{mypics.length} </span>{' '}
                    posts
                  </li>
                  <li>
                    <span className='profile-stat-count'>
                      {state ? state.followers.length : '0'}
                    </span>{' '}
                    followers
                  </li>
                  <li>
                    <span className='profile-stat-count'>
                      {state ? state.following.length : '0'}
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
              {/* <div
                className='file-field input-field'
                style={{ margin: '10px' }}
              >
                <div className='btn #64b5f6 blue darken-1'>
                  <span>Upload pic</span>
                  <input
                    type='file'
                    onChange={(e) => updatePhoto(e.target.files[0])}
                  />
                </div>
                <div className='file-path-wrapper'>
                  <input className='file-path valiadate' type='text' />
                </div>
              </div> */}
            </div>
          </div>
          <div className='container'>
            <div className='gallery'>
              {console.log('mypic', mypics)}
              {mypics.map((item, index) => (
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
                        {item.likes.length}
                      </li>
                      <li className='gallery-item-comments'>
                        <span className='visually-hidden'>Comments:</span>
                        <FontAwesomeIcon
                          icon={faComment}
                          aria-hidden='true'
                        ></FontAwesomeIcon>{' '}
                        {item.comments.length}
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
