import { faPray } from '@fortawesome/free-solid-svg-icons';
import React from 'react';
import '../styles/CreatePost.css';
import test from '../../assets/Logo.png';
import M from 'materialize-css';
import { useHistory } from 'react-router-dom';

export default function CreatePost() {
  const history = useHistory();
  const [body, setBody] = React.useState('');
  const [postImage, setPostImage] = React.useState('');
  const [imgURL, setImgURL] = React.useState(null);
  const [imgBase, setImgBase] = React.useState(null);

  const getImgURL = (data) => {
    setImgBase(URL.createObjectURL(data));
  };

  React.useEffect(() => {
    if (imgURL) {
      fetch('/createpost', {
        method: 'post',
        headers: {
          'Content-Type': 'application/json',
          authorization: 'Bearer ' + localStorage.getItem('jwt'),
        },
        body: JSON.stringify({
          body,
          img: imgURL,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          console.log(data);
          if (data.error) {
            M.toast({ html: data.error, classes: '#c62828 red darken-3' });
          } else {
            M.toast({
              html: 'Successfully Share!',
              classes: '#43a047 green darken-1',
            });
            history.push('/');
          }
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }, [imgURL]);

  const createPost = () => {
    const data = new FormData();
    data.append('file', postImage);
    data.append('upload_preset', 'Kaidow-Story');
    data.append('cloud_name', 'di8adkw2c');
    fetch('https://api.cloudinary.com/v1_1/di8adkw2c/image/upload', {
      method: 'post',
      body: data,
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        setImgURL(data.url);
      })
      .catch((err) => {
        console.log(err);
      });
    console.log(localStorage.getItem('jwt'));
  };

  return (
    <div
      className='card input-filed'
      style={{
        maxWidth: '50vh',
        margin: '5vh auto',
        padding: '5vh',
        textAlign: 'center',
      }}
    >
      <h4>Share your memory</h4>
      {imgBase !== null ? (
        <img src={imgBase} className='imgUploaded' />
      ) : (
        <img src={test} className='imgUploaded' />
      )}
      <input
        type='text'
        placeholder='Your caption'
        value={body}
        onChange={(e) => setBody(e.target.value)}
      />
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
            type='file'
            onChange={(e) => {
              setPostImage(e.target.files[0]);
              getImgURL(e.target.files[0]);
            }}
          />
        </div>

        <div className='file-path-wrapper'>
          <input className='file-path validate' type='text' />
        </div>
      </div>
      {console.log(imgBase)}

      <button className='btn-submit' onClick={() => createPost()}>
        Share!
      </button>
    </div>
  );
}
