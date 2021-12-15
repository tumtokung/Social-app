import React, { useState, useEffect, useContext } from 'react';
import { UserContext } from '../../App';
import '../styles/Login.css';
import { Link, useHistory } from 'react-router-dom';
import M from 'materialize-css';
import validator from 'validator';

export default function Login() {
  const [otp, setOtp] = useState('');
  const { state, dispatch } = useContext(UserContext);
  const history = useHistory();
  const myStyle = {
    boxShadow: '0 4px 8px 0 rgba(0,0,0,0.2)',
    transition: '0.3s',
  };

  const handleOnClick = (e) => {
    e.preventDefault();
    console.log(state);
    fetch('/verifiedOTP', {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: state.email,
        otp: otp,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.err === 'Wrong OTP') {
          console.log('ERR', data);
          M.toast({
            html: data.err,
            classes: '#c62828 red darken-3',
          });
        } else {
          console.log('after otp', data);
          localStorage.setItem('jwt', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));
          dispatch({ type: 'USER', payload: data.user });
          M.toast({ html: data.message, classes: '#43a047 green darken-1' });
          history.push('/');
        }
      });
  };

  const handleSendOTP = (e) => {
    e.preventDefault();
    fetch('/sendOTP', {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: state.email,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        const { status } = data;
        if (status) {
          // console.log('ERR', data);
          M.toast({
            html: status,
            classes: '#c62828 red darken-3',
          });
        }
      });
  };
  return (
    <div className='formStructor' style={myStyle}>
      <div className='login'>
        <div className='center'>
          <h2 className='formTitle' id='login' style={{ marginRight: 0 }}>
            OTP
          </h2>
          <form>
            <div className='formHolder'>
              <input
                type='text'
                className='input'
                placeholder='OTP'
                value={otp}
                onChange={(e) => {
                  setOtp(e.target.value);
                }}
              />
            </div>
            <button className={'submitBtn'} onClick={handleSendOTP}>
              Send OTP Again
            </button>
            <button
              type='submit'
              className={otp ? 'submitBtn' : 'submitBtnDisable'}
              disabled={!otp}
              onClick={handleOnClick}
            >
              Confirm OTP
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
