import React, { useState, useEffect, useContext } from 'react';
import './ProfilePage.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL, USER } from '../configs/host-config';
import AuthContext from '../context/UserContext';

const ProfilePage = () => {
  const [form, setForm] = useState({
    userId: '',
    email: '',
    name: '',
    address: '',
    phone: '',
    birthDate: '',
    role: '',
  });

  const navigate = useNavigate();
  const { isLoggedIn, isInit } = useContext(AuthContext);
  const { onLogout } = useContext(AuthContext);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleDelete = () => {
    const userId = localStorage.getItem('LOGIN_ID');
    const token = localStorage.getItem('ACCESS_TOKEN');

    if (!window.confirm('정말 탈퇴하시겠습니까?')) return;

    axios
      .delete(`${API_BASE_URL}${USER}/delete/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then(() => {
        alert('회원 탈퇴가 완료되었습니다.');
        sessionStorage.setItem('justDeleted', 'true');
        onLogout();
        navigate('/');
      })
      .catch((err) => {
        console.error('회원 탈퇴 실패:', err);
        alert('회원 탈퇴 중 오류가 발생했습니다.');
      });
  };

  const handleCancel = () => {
    navigate('/mypage');
  };

  const openPostCode = () => {
    new window.daum.Postcode({
      oncomplete: function (data) {
        const fullAddress = data.address;
        setForm((prevForm) => ({
          ...prevForm,
          address: fullAddress,
        }));
      },
    }).open();
  };

  useEffect(() => {
    const userId = localStorage.getItem('LOGIN_ID');
    const token = localStorage.getItem('ACCESS_TOKEN');

    if (!userId || !token) {
      alert('로그인이 필요합니다.');
      navigate('/login');
      return;
    }

    axios
      .get(`${API_BASE_URL}${USER}/profile/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        const user = res.data;
        setForm({
          userId: user.userId,
          email: user.email,
          name: user.name,
          address: user.address,
          phone: user.phone,
          birthDate: user.birthDate,
          role: user.role,
        });
      })
      .catch((err) => {
        console.error('회원 정보 조회 실패:', err);
        alert('회원 정보를 불러올 수 없습니다.');
      });
  }, []);

  useEffect(() => {
    if (isInit && !isLoggedIn) {
      const justDeleted = sessionStorage.getItem('justDeleted');
      if (justDeleted) {
        sessionStorage.removeItem('justDeleted');
        return;
      }
      alert('로그인한 회원만 접근 가능합니다.');
      navigate('/');
    }
  }, [isInit, isLoggedIn]);

  const handleUpdate = () => {
    const userId = localStorage.getItem('LOGIN_ID');
    const token = localStorage.getItem('ACCESS_TOKEN');

    axios
      .put(`${API_BASE_URL}${USER}/update/${userId}`, form, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then(() => {
        return axios.patch(
          `${API_BASE_URL}${USER}/address/${userId}`,
          { address: form.address },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
      })
      .then(() => {
        alert('회원정보가 수정되었습니다.');
        navigate('/mypage');
      })
      .catch((err) => {
        console.error('수정 실패:', err);
        alert('회원정보 수정 중 오류가 발생했습니다.');
      });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
  };

  return (
    <div className='profile-container'>
      <h2 className='profile-title'>Profile</h2>
      <form className='profile-form' onSubmit={handleSubmit}>
        <label>이메일</label>
        <input name='email' value={form.email} readOnly />

        <label>이름</label>
        <input name='name' value={form.name} onChange={handleChange} />

        <label>전화번호</label>
        <input name='phone' value={form.phone} onChange={handleChange} />

        <label>주소</label>
        <input name='address' value={form.address} onChange={handleChange} />
        <button type='button' onClick={openPostCode} className='postcode-btn'>
          우편번호
        </button>

        <label>생년월일</label>
        <input
          name='birthDate'
          value={form.birthDate}
          onChange={handleChange}
        />

        <div className='button-row'>
          <button type='button' className='btn-outline' onClick={handleDelete}>
            회원 탈퇴
          </button>
          <button className='profile-update-btn' onClick={handleUpdate}>
            회원 정보 수정하기
          </button>
          <button type='button' className='btn-outline' onClick={handleCancel}>
            취소
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfilePage;
