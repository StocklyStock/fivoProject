import React, { useEffect, useState } from 'react';
import { IconButton, InputBase, Tooltip, Button, Drawer, Box, List, ListItem, ListItemText } from '@mui/material';
import { Brightness4, Search, Menu as MenuIcon } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../slices/authSlice';
import { NavLink, useNavigate } from 'react-router-dom';
import { fetchStockSearch } from '../services/stockapi';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGlobe } from '@fortawesome/free-solid-svg-icons';
import './Header.css';

const Header = () => {
  const user = useSelector((state) => state.auth.user);
  const [language, setLanguage] = useState('ko');
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const toggleMenu = () => setMenuOpen(!menuOpen);

  const toggleSearch = () => {
    setSearchOpen(!searchOpen);
    if (!searchOpen) {
      // 검색을 열 때 검색 결과를 새로 불러옴
      handleSearch();
    } else {
      // 검색을 닫을 때 결과를 초기화
      setSearchResults([]);
    }
  };

  const handleNav = (path) => {
    navigate(path);
    setMenuOpen(false);
  };

  const handleSearch = async () => {
    if (inputValue.trim() === '') return;
    try {
      const results = await fetchStockSearch(inputValue);
      setSearchResults(results);
    } catch (err) {
      console.error('🔍 검색 오류:', err);
    }
  };

  const handleSelectStock = (stock) => {
    if (!stock.종목코드) return;
    navigate(`/stock/${stock.종목코드}`);
    setInputValue(''); // 검색 완료 후 입력값 초기화
    setSearchResults([]); // 검색 결과 초기화
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && searchResults.length > 0) {
      // `Enter` 키를 누르면 첫 번째 종목 선택
      handleSelectStock(searchResults[0]);
    }
  };

  useEffect(() => {
    if (inputValue.trim()) {
      handleSearch();
    } else {
      setSearchResults([]);
    }
  }, [inputValue]);

  return (
    <header>
      <nav>
        <ul className="nav-left">
          <li className="header-logo">
            <NavLink className="zen-dots-regular" to="/">FIVO</NavLink>
          </li>
          <li><NavLink onClick={() => handleNav('/admin/stats')} style={menuStyle}>테마 분석</NavLink></li>
          <li><NavLink onClick={() => handleNav('/admin/users')} style={menuStyle}>AI 추천</NavLink></li>
          <li>
            <IconButton sx={{ display: { xs: 'block', sm: 'none' }, ml: 'auto' }} onClick={toggleMenu}>
              <MenuIcon />
            </IconButton>
          </li>
        </ul>

        <ul className="nav-right">
          <li className="search-box-wrapper">
           
              {searchOpen && (
                <input
                  className="search-input"
                  placeholder="삼성전자 또는 005930"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}  // Enter 키 처리
            
                />
              )}
              <button onClick={toggleSearch} >
                <Search fontSize="small" color="action" />
              </button>
           

            {searchResults.length > 0 && (
              <ul className="dropdown-results" style={{
                maxHeight: '220px',
                overflowY: 'auto',
                marginTop: '5px',
                padding: '0',
                border: '1px solid #ddd',
                borderRadius: '5px',
                backgroundColor: 'white',
                listStyleType: 'none',
                display: 'block',
              }}>
                {searchResults.map((item, idx) => (
                  <li
                    key={idx}
                    onClick={() => handleSelectStock(item)}
                    className="dropdown-item"
             
                  >
                    {item.회사명} ({item.종목코드}) [{item.시장구분}]
                  </li>
                ))}
              </ul>
            )}
          </li>

          <li>
            <Tooltip title="다크모드 토글">
              <IconButton><Brightness4 /></IconButton>
            </Tooltip>
          </li>
          <li>
            <FontAwesomeIcon icon={faGlobe} />
            <select className="lang" value={language} onChange={(e) => setLanguage(e.target.value)}>
              <option value="ko">한국어</option>
              <option value="en">영어</option>
            </select>
          </li>
          <li><Button className="login-btn" onClick={handleLogout}>로그인</Button></li>
        </ul>

        <Drawer anchor="left" open={menuOpen} onClose={toggleMenu}>
          <Box sx={{ width: 250 }}>
            <List>
              <ListItem button onClick={() => handleNav('/admin/stats')}>
                <ListItemText primary="📊 통계 보기" />
              </ListItem>
              <ListItem button onClick={() => handleNav('/admin/users')}>
                <ListItemText primary="👥 사용자 목록" />
              </ListItem>
              <ListItem button onClick={() => handleNav('/admin/notifications')}>
                <ListItemText primary="🔔 알림 설정" />
              </ListItem>
            </List>
          </Box>
        </Drawer>
      </nav>
    </header>
  );
};

const menuStyle = {
  cursor: 'pointer',
  fontWeight: 'bold',
  color: 'inherit',
  textDecoration: 'none',
  marginLeft: '1rem'
};

export default Header;
