import React, { useEffect, useState, useContext } from 'react';
import '../styles/Admin.css';
import { faHeart, faCog, faComment } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Moment from 'moment';
import { MDBDataTable } from 'mdbreact';
import { UserContext } from '../../App';
import '@fortawesome/fontawesome-free/css/all.min.css';
import 'bootstrap-css-only/css/bootstrap.min.css';
import 'mdbreact/dist/css/mdb.css';
export default function Admin() {
  const { state, dispatch } = React.useContext(UserContext);
  const [data, setData] = useState({});
  const [search, setSearch] = useState(null);

  React.useEffect(() => {
    fetch('/logs', {
      headers: {
        authorization: 'Bearer ' + localStorage.getItem('jwt'),
      },
    })
      .then((res) => res.json())
      .then((res) => {
        setData({
          columns: [
            {
              label: 'Email',
              field: 'email',
              sort: 'asc',
              width: 150,
            },
            {
              label: 'Event',
              field: 'event',
              sort: 'asc',
              width: 150,
            },
            {
              label: 'Time',
              field: 'timeFromNow',
              sort: 'asc',
              width: 150,
            },
          ],
          rows: res.updated,
        });
      })
      .catch((err) => {
        console.log(err);
        // res.json({ error: 'Something went wrong' });
      });
  }, []);

  return (
    <>
      {/* {state ? (
        state.email === 'phakawat.ta@ku.th' ? ( */}
      <div className='card-all'>
        <h3>history event</h3>
        <MDBDataTable striped bordered small id='logTable' data={data} />
      </div>
      {/* ) : (
          <h1>PAGE NOT FOUND</h1>
        )
      ) : (
        <h1>PAGE NOT FOUND</h1>
      )} */}
    </>
  );
}
