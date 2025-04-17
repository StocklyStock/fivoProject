import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell as farBell, faCircleUser as farCircleUser } from '@fortawesome/free-regular-svg-icons';
import { NavLink, useNavigate } from 'react-router-dom';
import { logout } from '../slices/authSlice';
import { useDispatch,useSelector } from 'react-redux';


const LoginStateMenus = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const user = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  return (
    <>
      <li className='my-menu' onClick={() => setMenuOpen((prevState) => !prevState)}>
       
        <FontAwesomeIcon icon={farCircleUser}/>
        
        <div className={`my-sub-menu`}>
          <NavLink to="/dashboard">마이페이지</NavLink>
          <button
            type='button'
            className="logout-btn"
            color="error"
            onClick={() => {
            console.log('🚀 로그아웃 클릭됨');
            dispatch(logout());
            setTimeout(() => {
              navigate('/', { replace: true });
            }, 0);
            }}
          >
            로그아웃
          </button>

        </div>
      </li>
      <li><FontAwesomeIcon icon={farBell}/></li>
    </>
  );
}

export default LoginStateMenus;