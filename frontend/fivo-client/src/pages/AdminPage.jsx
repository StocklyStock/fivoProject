import { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Paper,
  CircularProgress,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import Layout from '../components/Layout';
import { useDispatch } from 'react-redux';
import { logout } from '../auth/authSlice';
import { useNavigate } from 'react-router-dom';
import AdminStats from './AdminStats';
import AdminNotifications from './AdminNotifications';

const AdminPage = () => {
  const [tab, setTab] = useState(null); // ✅ 초기 null
  const [ready, setReady] = useState(false); // ✅ 렌더링 준비 상태
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    navigate('/login');
  };

  const handleTabChange = (_, newValue) => {
    setTab(newValue);
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await axios.get('/api/accounts/all/', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (Array.isArray(response.data)) {
        setUsers(response.data);
        setFilteredUsers(response.data);
      } else {
        setUsers([]);
        setFilteredUsers([]);
      }
    } catch (error) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem('accessToken');
        navigate('/login');
      } else {
        setUsers([]);
        setFilteredUsers([]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      navigate('/login');
    }
    setTab(0); // ✅ 탭 초기값 설정
    setReady(true); // ✅ 렌더링 준비 완료
  }, []);

  useEffect(() => {
    if (tab === 1) {
      fetchUsers();
    }
  }, [tab]);

  useEffect(() => {
    const filtered = users.filter(
      (user) =>
        user.email.toLowerCase().includes(search.toLowerCase()) ||
        user.nickname.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredUsers(filtered);
  }, [search, users]);

  return (
    <Layout>
      <Box className="p-6">
        <Box className="flex justify-between items-center">
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            🛠 관리자 페이지
          </Typography>
          <Button variant="outlined" color="error" onClick={handleLogout}>
            로그아웃
          </Button>
        </Box>

        {ready && (
          <Paper elevation={1} className="rounded-xl overflow-hidden">
            <Tabs
              value={tab}
              onChange={handleTabChange}
              indicatorColor="primary"
              textColor="primary"
              centered
            >
              <Tab label="📊 통계 보기" />
              <Tab label="👥 사용자 목록" />
              <Tab label="🔔 알림 설정" />
            </Tabs>
          </Paper>
        )}

        {ready && tab === 0 && <AdminStats />}

        {ready && tab === 1 && (
          <Box mt={4}>
            <TextField
              label="사용자 검색"
              variant="outlined"
              fullWidth
              margin="normal"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            {loading ? (
              <Box className="flex justify-center mt-10">
                <CircularProgress />
              </Box>
            ) : (
              <TableContainer component={Paper} className="rounded-xl shadow-md">
                <Table>
                  <TableHead className="bg-gray-100">
                    <TableRow>
                      <TableCell>이메일</TableCell>
                      <TableCell>닉네임</TableCell>
                      <TableCell>전화번호</TableCell>
                      <TableCell align="center">인증 여부</TableCell>
                      <TableCell align="center">관리자 여부</TableCell>
                      <TableCell align="center">가입일</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredUsers.length > 0 ? (
                      filteredUsers.map((user) => (
                        <TableRow
                          key={user.id}
                          onClick={() => setSelectedUser(user)}
                          hover
                          sx={{ cursor: 'pointer' }}
                        >
                          <TableCell>{user.email}</TableCell>
                          <TableCell>{user.nickname}</TableCell>
                          <TableCell>{user.phone}</TableCell>
                          <TableCell align="center">
                            <Chip
                              label={user.is_verified ? '인증 완료' : '미인증'}
                              color={user.is_verified ? 'success' : 'default'}
                              size="small"
                            />
                          </TableCell>
                          <TableCell align="center">
                            <Chip
                              label={user.is_staff ? '관리자' : '일반'}
                              color={user.is_staff ? 'primary' : 'default'}
                              size="small"
                            />
                          </TableCell>
                          <TableCell align="center">
                            {new Date(user.date_joined).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} align="center">
                          유저 목록이 없습니다.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}

            <Dialog open={!!selectedUser} onClose={() => setSelectedUser(null)}>
              <DialogTitle>사용자 상세 정보</DialogTitle>
              <DialogContent dividers>
                {selectedUser && (
                  <Box>
                    <Typography>Email: {selectedUser.email}</Typography>
                    <Typography>닉네임: {selectedUser.nickname}</Typography>
                    <Typography>전화번호: {selectedUser.phone}</Typography>
                    <Typography>
                      인증 여부: {selectedUser.is_verified ? '✅' : '❌'}
                    </Typography>
                    <Typography>
                      관리자 여부: {selectedUser.is_staff ? '✅' : '❌'}
                    </Typography>
                    <Typography>
                      가입일: {new Date(selectedUser.date_joined).toLocaleString()}
                    </Typography>
                  </Box>
                )}
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setSelectedUser(null)}>닫기</Button>
              </DialogActions>
            </Dialog>
          </Box>
        )}

        {ready && tab === 2 && <AdminNotifications />}
      </Box>
    </Layout>
  );
};

export default AdminPage;
