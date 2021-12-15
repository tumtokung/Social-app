import React, { useContext, useState, useEffect, useRef } from 'react';
import { UserContext } from '../../App';
import { Link, useHistory } from 'react-router-dom';
import { useParams } from 'react-router';
import styles from '../styles/Forgot.css';
import M from 'materialize-css';
import { withRouter } from 'react-router-dom';
import validator from 'validator';
function Forgot(props) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const expDate = useRef('');
  const history = useHistory();
  useEffect(() => {
    // console.log(props.location.pathname.split('/forgot/'));
    expDate.current =
      props.location.pathname.split('/forgot')[
        props.location.pathname.split('/forgot').length - 1
      ];
    console.log('expDate = ', expDate);
  }, []);

  function toggleShow() {
    var x = document.getElementById('newPassword');
    var y = document.getElementById('confirmNewPassword');

    if (x.type === 'password') {
      x.type = 'text';
    } else {
      x.type = 'password';
    }

    if (y.type === 'password') {
      y.type = 'text';
    } else {
      y.type = 'password';
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password.length < 8 || password.length > 19) {
      M.toast({
        html: 'Password must be 8-19 characters',
        classes: '#c62828 red darken-3',
      });
      return;
    }
    if (password !== confirmPassword && confirmPassword) {
      M.toast({
        html: 'Password not matched',
        classes: '#c62828 red darken-3',
      });
      return;
    }
    if (
      !validator.isStrongPassword(password, {
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
    console.log('check = ', {
      password,
      expirePasswordDate: expDate.current,
    });
    if (password === confirmPassword) {
      fetch('/setPassword', {
        method: 'put',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          password,
          expirePasswordDate: expDate.current.replace('/', ''),
        }),
      })
        .then((res) => res.json())
        .then((res) => {
          console.log('data res  = ', res);
          // validate here
          if (res.status === 'error') {
            M.toast({
              html: `${res.info}`,
              classes: '#c62828 red darken-3',
            });
          } else {
            M.toast({
              html: 'Reset Password Complete!',
              classes: '#c62828 green darken-3',
            });
            history.push('/login');
          }
        });
    }
  };
  return (
    <div className='card-forgot'>
      <div className='addDetail'>
        <div className='formTitle'>
          <h2>Change your password</h2>
        </div>
        <form>
          <div className='formHolder'>
            <input
              type='password'
              // className={styles.input}
              id='newPassword'
              placeholder='New Password'
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
              }}
            />
            <input
              type='password'
              id='confirmNewPassword'
              // className={styles.input}
              placeholder='Confirm Password'
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
          <div className='switch showhide'>
            <label>
              Hide
              <input type='checkbox' />
              <span className='lever' onClick={() => toggleShow()} />
              Show
            </label>
          </div>
          {/* <button onClick={() => handleSubmit()}>click</button> */}
          <button
            onClick={(e) => {
              handleSubmit(e);
              setPassword('');
              setConfirmPassword('');
            }}
            type='submit'
            className={
              password && confirmPassword ? 'submitBtn' : 'submitBtnDisable'
            }
            disabled={!password && !confirmPassword}
          >
            Submit
          </button>
        </form>{' '}
      </div>
    </div>
  );
}
export default withRouter(Forgot);
