import React, { useEffect, useContext, useState } from 'react';
import { UserContext } from '../../App';
import '../styles/Login.css';
import { Link, useHistory } from 'react-router-dom';
import M from 'materialize-css';
import validator from 'validator';
// import ReCAPTCHA from 'react-google-recaptcha';
import PolicyText from './Policy';

function move() {
  // console.clear();
  const loginBtn = document.getElementById('login');
  const signupBtn = document.getElementById('signup');
  loginBtn.addEventListener('click', (e) => {
    let parent = e.target.parentNode.parentNode;
    Array.from(e.target.parentNode.parentNode.classList).find((element) => {
      if (element !== 'slideUp') {
        parent.classList.add('slideUp');
      } else {
        signupBtn.parentNode.classList.add('slideUp');
        parent.classList.remove('slideUp');
      }
    });
  });
  signupBtn.addEventListener('click', (e) => {
    let parent = e.target.parentNode;
    Array.from(e.target.parentNode.classList).find((element) => {
      if (element !== 'slideUp') {
        parent.classList.add('slideUp');
      } else {
        loginBtn.parentNode.parentNode.classList.add('slideUp');
        parent.classList.remove('slideUp');
      }
    });
  });
}

const Policy = ({ setOpenDialog, setTermAgree, handleRegister }) => {
  console.log('handle');
  return (
    <div className='policyModal'>
      <div className='policyModal-content'>
        <button
          className='close'
          onClick={() => {
            setOpenDialog(false);
          }}
        >
          X
        </button>
        <h6 className='headPolicy'>นโยบายความเป็นส่วนตัว</h6>
        <PolicyText
          setAgree={setTermAgree}
          dialog={setOpenDialog}
          register={handleRegister}
        />
      </div>
    </div>
  );
};

export default function Login() {
  const history = useHistory();
  const [nameRegis, setNameRegis] = React.useState('');
  const [passwordRegis, setPasswordRegis] = React.useState('');
  const [emailRegis, setEmailRegis] = React.useState('');
  const [confirmRegis, setConfirmRegis] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [notice, setNotice] = React.useState(false);
  const [noticeName, setNoticeName] = React.useState(false);
  const [check, setCheck] = React.useState(false);
  const { state, dispatch } = React.useContext(UserContext);
  const [stateSlide, setStateSlide] = React.useState('signup');
  const [image, setImage] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [agree, setAgree] = useState(false);
  useEffect(() => {
    if (passwordRegis === confirmRegis) {
      setCheck(true);
    } else {
      setCheck(false);
    }
  }, [confirmRegis]);

  useEffect(() => {
    const loginBtn = document.getElementById('login');
    const signupBtn = document.getElementById('signup');
    loginBtn.addEventListener('click', (e) => {
      // if (stateSlide === 'login') {

      console.log('state = ', stateSlide);
      let parent = e.target.parentNode.parentNode;
      Array.from(e.target.parentNode.parentNode.classList).find((element) => {
        if (element !== 'slideUp') {
          if (stateSlide === 'signUp') {
            parent.classList.add('slideUp');
            setStateSlide('login');
          }
          // else {
          //   setStateSlide('signUp');
          // }
        } else {
          signupBtn.parentNode.classList.add('slideUp');
          parent.classList.remove('slideUp');
        }
      });
      //   setStateSlide('login');
      // }
    });
    signupBtn.addEventListener('click', (e) => {
      // if (stateSlide === 'signUp') {
      console.log('state = ', stateSlide);
      let parent = e.target.parentNode;
      Array.from(e.target.parentNode.classList).find((element) => {
        if (element !== 'slideUp') {
          if (stateSlide === 'login') {
            parent.classList.add('slideUp');
            setStateSlide('signUp');
          }
          // else {
          //   setStateSlide('login');
          // }
        } else {
          loginBtn.parentNode.parentNode.classList.add('slideUp');
          parent.classList.remove('slideUp');
        }
      });
      //   setStateSlide('signUp');
      // }
    });
  }, []);

  const GetLogin = (e) => {
    e.preventDefault();
    if (
      !/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
        email
      )
    ) {
      M.toast({
        html: 'Invalid email format',
        classes: '#c62828 red darken-3',
      });
      return;
    }
    fetch('/login', {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          M.toast({ html: data.error, classes: '#c62828 red darken-3' });
        } else {
          // console.log('login data', data);
          localStorage.setItem('jwt', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));
          dispatch({ type: 'USER_EMAIL', payload: email });
          M.toast({ html: data.message, classes: '#43a047 green darken-1' });
          history.push('/otp');
          // history.push('/');
        }
      });
    // .catch((e) => {
    //   M.toast({
    //     html: 'Incorrect',
    //     classes: '#c62828 red darken-3',
    //   });
    // });
  };
  const getRegis = (e) => {
    e.preventDefault();
    if (/[ `!@#$%^&*()+\-=\[\]{};':"\\|,<>\/?~]/.test(nameRegis)) {
      M.toast({
        html: 'username must have not special character',
        classes: '#c62828 red darken-3',
      });
      return;
    }
    if (nameRegis.indexOf(' ') >= 0) {
      M.toast({
        html: 'username must have not space',
        classes: '#c62828 red darken-3',
      });
      return;
    }
    if (
      !/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
        emailRegis
      )
    ) {
      M.toast({
        html: 'Invalid email format',
        classes: '#c62828 red darken-3',
      });
      return;
    }
    if (passwordRegis.length < 8 || passwordRegis.length > 19) {
      M.toast({
        html: 'Password must be 8-19 characters',
        classes: '#c62828 red darken-3',
      });
      return;
    }
    if (passwordRegis !== confirmRegis && confirmRegis) {
      M.toast({
        html: 'Password not matched',
        classes: '#c62828 red darken-3',
      });
      return;
    }
    if (
      !validator.isStrongPassword(passwordRegis, {
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      })
    ) {
      M.toast({
        html: 'Password must contain at least one lower-case letter, one upper-case letter, one digit and a special character',
        classes: '#c62828 red darken-3',
      });
      return;
    }
    setOpenDialog(true);
  };
  const handleRegister = () => {
    console.log('SIGNUP');
    fetch('/signup', {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: nameRegis.toLowerCase(),
        email: emailRegis,
        password: passwordRegis,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          M.toast({ html: data.error, classes: '#c62828 red darken-3' });
        } else {
          M.toast({
            html: 'Succesful Register',
            classes: '#43a047 green darken-1',
          });
          window.location.reload();
        }
      });
    setOpenDialog(false);
  };
  return (
    <>
      {openDialog && (
        <Policy
          setOpenDialog={setOpenDialog}
          handleRegister={handleRegister}
          setTermAgree={setAgree}
        ></Policy>
      )}
      <div className='formStructor'>
        <div className='signup slideUp'>
          <h2 className='formTitle' id='signup'>
            <span>OR</span>Sign up
          </h2>
          <form>
            <div className='formHolder'>
              <input
                type='text'
                className='input'
                placeholder='Name'
                value={nameRegis}
                onChange={(e) => setNameRegis(e.target.value)}
                onMouseEnter={(e) => setNoticeName(true)}
                onMouseLeave={(e) => setNoticeName(false)}
              />
              {noticeName ? (
                <span className='popupname'>
                  username must be contain only letter ,nummeric or . and _
                </span>
              ) : null}
              <input
                type='text'
                className='input'
                placeholder='Email'
                value={emailRegis}
                onChange={(e) => setEmailRegis(e.target.value)}
              />
              <input
                type='password'
                className='input'
                placeholder='Password'
                value={passwordRegis}
                onChange={(e) => {
                  setPasswordRegis(e.target.value);
                }}
                onMouseEnter={(e) => setNotice(true)}
                onMouseLeave={(e) => setNotice(false)}
              />
              {notice ? (
                <span className='popuptext'>
                  At least 8-19 characters, must contain at least one lower-case
                  letter, one upper-case letter, one digit and a special
                  character
                </span>
              ) : null}
              <input
                type='password'
                className='input'
                placeholder='Confirm Password'
                value={confirmRegis}
                onChange={(e) => {
                  setConfirmRegis(e.target.value);
                }}
              />
            </div>
            {!check && confirmRegis !== '' ? (
              <p
                style={{
                  color: 'red',
                  background: 'white',
                  textAlign: 'center',
                  fontSize: '12px',
                }}
              >
                Password not matched
              </p>
            ) : null}
            <button
              className={
                emailRegis && nameRegis && passwordRegis && confirmRegis
                  ? 'submitBtn'
                  : 'submitBtnDisable'
              }
              disabled={
                !emailRegis && !nameRegis && !passwordRegis && !confirmRegis
              }
              onClick={(e) => getRegis(e)}
            >
              Sign up
            </button>
          </form>
          {}
        </div>
        <div className='login'>
          <div className='center'>
            <h2 className='formTitle' id='login'>
              <span>OR</span>Log in
            </h2>
            <form>
              <div className='formHolder'>
                <input
                  type='text'
                  className='input'
                  placeholder='Email'
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <input
                  type='password'
                  className='input'
                  placeholder='Password'
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <button
                type='submit'
                className='submitBtn'
                onClick={(e) => {
                  GetLogin(e);
                  setPassword('');
                }}
              >
                Log in
              </button>
            </form>
            <div className='line'>
              <h3>
                <span>OR</span>
              </h3>
            </div>
            <div className='forgot'>
              <a href='/forgotpassword'>Forgot password?</a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
