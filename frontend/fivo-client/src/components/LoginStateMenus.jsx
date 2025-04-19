import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell as farBell, faCircleUser as farCircleUser } from '@fortawesome/free-regular-svg-icons';
import { NavLink, useNavigate } from 'react-router-dom';
import { logout } from '../slices/authSlice';
import { useDispatch, useSelector } from 'react-redux';
import api from '../services/api'; // axios 래퍼
import './LoginStateMenus.css'; // 드롭다운 스타일용
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from '@mui/material';

const LoginStateMenus = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [notiOpen, setNotiOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [selectedNoti, setSelectedNoti] = useState(null);
  const user = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/api/accounts/notifications/public/');
      setNotifications(res.data);
    } catch (err) {
      console.error('🔔 알림 불러오기 실패', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  return (
    <>
      {/* 🔵 유저 메뉴 */}
      <li className="my-menu" onClick={() => setMenuOpen((prev) => !prev)}>
        <FontAwesomeIcon icon={farCircleUser} />
        {menuOpen && (
          <div className="my-sub-menu">
            <NavLink to={user?.is_staff ? "/admin/stats" : "/dashboard"}>
              {user?.is_staff ? "관리페이지" : "마이페이지"}
            </NavLink>
            <button
              type="button"
              className="logout-btn"
              onClick={() => {
                console.log('🚀 로그아웃 클릭됨');
                dispatch(logout());
                setTimeout(() => navigate('/', { replace: true }), 0);
              }}
            >
              로그아웃
            </button>
          </div>
        )}
      </li>

      {/* 🔔 알림 아이콘 */}
      <li className="notification-menu" onClick={() => setNotiOpen((prev) => !prev)}>
        <FontAwesomeIcon icon={farBell} />
        {notiOpen && (
          <div className="notification-dropdown">
            <p className="dropdown-title">📢 최근 알림</p>
            {notifications.length > 0 ? (
                notifications.slice(0, 5).map((n) => (
                  <div
                    key={n.id}
                    className="notification-item"
                    onClick={() => setSelectedNoti(n)} // ✅ 클릭 시 선택
                    style={{ cursor: 'pointer' }}
                  >
                    <strong>[{n.type === 'notice' ? '공지' : '이벤트'}]</strong> {n.title}
                  </div>
                ))
              ) : (
                <p className="notification-empty">알림이 없습니다.</p>
            )}
          </div>
        )}
      </li>
      <Dialog open={!!selectedNoti} onClose={() => setSelectedNoti(null)}>
        <DialogTitle>
          [{selectedNoti?.type === 'notice' ? '공지' : '이벤트'}] {selectedNoti?.title}
        </DialogTitle>
        <DialogContent dividers>
          <Typography style={{ whiteSpace: 'pre-line' }}>
            {selectedNoti?.message}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedNoti(null)}>닫기</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default LoginStateMenus;
