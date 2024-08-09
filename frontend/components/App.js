import React, { useState } from 'react';
import { NavLink, Routes, Route, useNavigate } from 'react-router-dom';
import Articles from './Articles';
import LoginForm from './LoginForm';
import Message from './Message';
import ArticleForm from './ArticleForm';
import Spinner from './Spinner';
import axios from 'axios';
import PrivateRoute from './PrivateRoute'; 

const articlesUrl = 'http://localhost:9000/api/articles';
const loginUrl = 'http://localhost:9000/api/login';

export default function App() {
  const [message, setMessage] = useState('');
  const [articles, setArticles] = useState([]);
  const [currentArticleId, setCurrentArticleId] = useState(null);
  const [spinnerOn, setSpinnerOn] = useState(false);
  const currentArticle = articles.find(a => a.article_id === currentArticleId);

  const navigate = useNavigate();
  const redirectToLogin = () => { navigate('/'); }
  const redirectToArticles = (username) => {
    localStorage.setItem('username', username);
    navigate('/articles');
  }

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setMessage('Goodbye!');
    redirectToLogin();
  }

  const login = async ({ username, password }) => {
    setMessage('');
    setSpinnerOn(true);
    try {
      const { data } = await axios.post(loginUrl, { username, password });
      localStorage.setItem('token', data.token);
      console.log(username);
      setMessage('Login successful!');
      redirectToArticles(username); 
    } catch (err) {
      setMessage(err?.response?.data?.message || 'An error occurred. Please try again');
    } finally {
      setSpinnerOn(false);
    }
  }

  const getArticles = async () => {  
    setSpinnerOn(true);
    try {
      const { data } = await axios.get(articlesUrl, {
        headers: {
          'Authorization': localStorage.getItem('token')
        }
      });
      console.log('Articles fetched:', data.articles);
      const username = localStorage.getItem('username'); 
      setArticles(data.articles);
      setMessage(data.articles.length ? `Here are your articles, ${username}!` : 'No articles found');
    } catch (err) {
      if (err.response?.status === 401) redirectToLogin();
      setMessage(err.message || 'Problems getting articles');
    } finally {
      setSpinnerOn(false);
    }
  }

  const postArticle = async (article) => {
    console.log('Posting a new article');

    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username'); 
    if (!token) {
      setMessage('No token found. Please log in again.');
      return;
    }

    try {
      const response = await fetch('http://localhost:9000/api/articles', {
        method: 'POST',
        body: JSON.stringify(article),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error response:', errorData);
        throw new Error('Posting problems');
      }

      const data = await response.json();
      console.log('Article posted:', data);

      setArticles([...articles, data.article]);
      setMessage(`Well done, ${username}. Great article!`); 
    } catch (err) {
      console.error('Error posting article:', err);
      setMessage(err.message || 'An error occurred while posting the article');
    }
  };

  const updateArticle = async (article_id, article) => {
    console.log('Updating the article');
  
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username'); 
    if (!token) {
      setMessage('No token found. Please log in again.');
      return;
    }
  
    try {
      const response = await fetch(`${articlesUrl}/${article_id}`, {
        method: 'PUT',
        body: JSON.stringify(article),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        }
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error response:', errorData);
        throw new Error('Updating problems');
      }
  
      const data = await response.json();
      console.log('Article updated:', data);
  
      const updatedArticles = articles.map(a =>
        a.article_id === article_id ? data.article : a
      );
      setArticles(updatedArticles);
      setMessage(`Nice update, ${username}!`); 
    } catch (err) {
      console.error('Error updating article:', err);
      setMessage(err.message || 'An error occurred while updating the article');
    }
  };

  const deleteArticle = async (article_id) => {
    console.log('Deleting the article');

    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username'); 
    if (!token) {
      setMessage('No token found. Please log in again.');
      return;
    }

    try {
      const response = await fetch(`${articlesUrl}/${article_id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': token
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error response:', errorData);
        throw new Error('Deleting problems');
      }

      console.log('Article deleted');
      setArticles(articles.filter(a => a.article_id !== article_id));
      setMessage(`Article ${article_id} was deleted, ${username}!`); 
    } catch (err) {
      console.error('Error deleting article:', err);
      setMessage(err.message || 'An error occurred while deleting the article');
    }
  };


  return (
    <>
      <Spinner on={spinnerOn} />
      <Message message={message} />
      <button id="logout" onClick={logout}>Logout from app</button>
      <div id="wrapper" style={{ opacity: spinnerOn ? "0.25" : "1" }}>
        <h1>Advanced Web Applications</h1>
        <nav>
          <NavLink id="loginScreen" to="/">Login</NavLink>
          <NavLink id="articlesScreen" to="/articles">Articles</NavLink>
        </nav>
        <Routes>
          <Route path="/" element={<LoginForm login={login} />} />
          <Route path="/articles" element={
             <PrivateRoute element={
              <>
                <ArticleForm
                  postArticle={postArticle}
                  updateArticle={updateArticle}
                  currentArticle={currentArticle}
                  setCurrentArticleId={setCurrentArticleId}
                  reset={() => setCurrentArticleId(null)}
                /> 
                <Articles
                  articles={articles}
                  deleteArticle={deleteArticle}
                  getArticles={getArticles}
                  setCurrentArticleId={setCurrentArticleId}
                />
              </>
            } />
          } />
        </Routes>
        <footer>Bloom Institute of Technology 2024</footer>
      </div>
    </>
  );
}

