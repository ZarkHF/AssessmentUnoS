import React, { useState } from 'react';
import styled from '@emotion/styled';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';

const LoginContainer = styled.div`
    max-width: 400px;
    margin: 40px auto;
    padding: 30px;
    background-color: ${props => props.theme.colors.cardBg};
    border: 2px solid ${props => props.theme.colors.primary};
    border-radius: ${props => props.theme.borderRadius.medium};
    box-shadow: ${props => props.theme.shadows.large};
    position: relative;
    overflow: hidden;

    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 4px;
        background: linear-gradient(to right, 
            ${props => props.theme.colors.primary}, 
            ${props => props.theme.colors.accent}
        );
    }
`;

const Title = styled.h2`
    text-align: center;
    margin-bottom: 2rem;
    color: ${props => props.theme.colors.primary};
    text-shadow: ${props => props.theme.shadows.glow};
`;

const FormGroup = styled.div`
    margin-bottom: 1.5rem;

    label {
        display: block;
        margin-bottom: 0.5rem;
        font-family: ${props => props.theme.fonts.secondary};
        color: ${props => props.theme.colors.text};
    }

    input {
        width: 100%;
        border: 1px solid ${props => props.theme.colors.border};
        background-color: ${props => props.theme.colors.background};
        color: ${props => props.theme.colors.text};
        padding: 0.8rem;
        border-radius: ${props => props.theme.borderRadius.small};
        transition: ${props => props.theme.transitions.default};

        &:focus {
            border-color: ${props => props.theme.colors.primary};
            box-shadow: ${props => props.theme.shadows.glow};
        }
    }
`;

const Button = styled.button`
    width: 100%;
    padding: 1rem;
    background-color: ${props => props.theme.colors.primary};
    color: ${props => props.theme.colors.text};
    border: none;
    border-radius: ${props => props.theme.borderRadius.small};
    font-size: 1.1rem;
    font-weight: 600;
    transition: ${props => props.theme.transitions.default};

    &:hover:not(:disabled) {
        background-color: ${props => props.theme.colors.accent};
        box-shadow: ${props => props.theme.shadows.glow};
        transform: translateY(-2px);
    }

    &:disabled {
        background-color: ${props => props.theme.colors.border};
    }
`;

const Error = styled.div`
    color: ${props => props.theme.colors.error};
    font-size: 0.9rem;
    margin-top: 0.5rem;
    text-align: center;
    animation: fadeIn 0.3s ease-in;

    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(-10px); }
        to { opacity: 1; transform: translateY(0); }
    }
`;

const RegisterLink = styled.button`
    background: none;
    border: none;
    color: ${props => props.theme.colors.accent};
    margin-top: 1rem;
    font-size: 1rem;
    text-decoration: underline;
    display: block;
    width: 100%;
    text-align: center;

    &:hover {
        color: ${props => props.theme.colors.primary};
        text-shadow: ${props => props.theme.shadows.glow};
    }
`;

const validationSchema = Yup.object().shape({
    username: Yup.string().required('Username is required'),
    password: Yup.string().required('Password is required')
});

const Login = () => {
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleSubmit = async (values, { setSubmitting }) => {
        try {
            await authService.login(values);
            navigate('/home');
        } catch (err) {
            setError(err.error || 'An error occurred during login');
            setTimeout(() => setError(null), 5000);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <LoginContainer>
            <Title>Enter the Library</Title>
            <Formik
                initialValues={{ username: '', password: '' }}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
            >
                {({ isSubmitting, errors, touched }) => (
                    <Form>
                        <FormGroup>
                            <label htmlFor="username">Username</label>
                            <input
                                type="text"
                                name="username"
                                placeholder="Enter your username"
                            />
                            {errors.username && touched.username && (
                                <Error>{errors.username}</Error>
                            )}
                        </FormGroup>

                        <FormGroup>
                            <label htmlFor="password">Password</label>
                            <input
                                type="password"
                                name="password"
                                placeholder="Enter your password"
                            />
                            {errors.password && touched.password && (
                                <Error>{errors.password}</Error>
                            )}
                        </FormGroup>

                        {error && <Error>{error}</Error>}

                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? 'Entering...' : 'Enter'}
                        </Button>

                        <RegisterLink type="button" onClick={() => navigate('/register')}>
                            Join the Dark Library
                        </RegisterLink>
                    </Form>
                )}
            </Formik>
        </LoginContainer>
    );
};

export default Login;