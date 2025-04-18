import { useState } from 'react';
import {IconButton, Tooltip} from "@mui/material";
import { Brightness4} from '@mui/icons-material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleUser as farCircleUser} from '@fortawesome/free-regular-svg-icons';
import { faChartLine, faGlobe, faRobot } from '@fortawesome/free-solid-svg-icons';
import { NavLink, useNavigate } from 'react-router-dom';
import { logout } from '../slices/authSlice';
import { useDispatch,useSelector } from 'react-redux';
import React from 'react';

const NavbarResponsive = () => {
     const [isKor, setIsKor] = useState(true);
     
      const user = useSelector((state) => state.auth.user);
      const dispatch = useDispatch();
      const navigate = useNavigate();

    return (
        <nav className="navbar-responsive">
            <ul>
                <li><NavLink to="/admin/stats"><FontAwesomeIcon icon={faChartLine}/><span>테마 분석</span></NavLink></li>
                <li><NavLink to="/airecomm"><FontAwesomeIcon icon={faRobot}/><span>AI 추천</span></NavLink></li>
                <li className='color-mode'>
                    <button type='button'>
                        <Brightness4 />
                        <span>컬러모드</span>
                    </button>
                </li>
                <li onClick={() => setIsKor((prevState) => !prevState)}>
                    <button type='button'>
                        <FontAwesomeIcon icon={faGlobe} />
                        <span>{isKor ? '한국어' : '영어'}</span>
                    </button>
                </li>
                <li onClick={() => {user ? navigate("/dashboard") : navigate("/login")}}>
                    <button type='button'>
                    <FontAwesomeIcon icon={farCircleUser}/>
                    <span>마이페이지</span>
                    </button>
                </li>
            </ul>
        </nav>
    );
}
export default NavbarResponsive;