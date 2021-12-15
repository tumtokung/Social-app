export const initialState = null;

export const reducer = (state, action) => {
  if (action.type === 'USER_EMAIL') {
    return { ...state, email: action.payload };
  }
  if (action.type === 'USER') {
    return { ...state, ...action.payload };
  }
  if (action.type === 'CLEAR') {
    return null;
  }
  if (action.type == 'UPDATEPIC') {
    return {
      ...state,
      pic: action.payload,
    };
  }
  if (action.type == 'UPDATENAME') {
    console.log('name');
    return {
      ...state,
      name: action.payload,
    };
  }
  if (action.type == 'UPDATE') {
    return {
      ...state,
      followers: action.payload.followers,
      following: action.payload.following,
    };
  }
  return state;
};
