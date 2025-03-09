import React from 'react';
import styled from 'styled-components';
import GoogleLogo from '../../assets/google.png'; 
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../../config/firebaseConfig';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { googleLogin } from '../../store/authSlice';
import { AppDispatch } from '../../store';
const Container = styled.div`
  display: flex;
  height: 100vh;
`;

const LeftSection = styled.div`
  flex: 0 0 40%;
  background-color: #0057d9;
  color: white;
  font-family: Arial, sans-serif;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  flex-direction: column;
  text-align: center;
  padding: 20px;
`;

const Logo = styled.div`
  position: absolute;
  top: 20px;
  left: 20px;
  font-size: 24px;
  font-weight: bold;
`;

const ImageOverlay = styled.div`
  width: 100%;
  height: 100%;
  background-image: url('your-image-url.jpg'); // Replace with your image URL
  background-size: cover;
  background-position: center;
  opacity: 0.5;
  position: absolute;
`;

const RightSection = styled.div`
  flex: 0 0 60%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background-color: white;
`;

const FormContainer = styled.div`
  width: 100%;
  max-width: 400px;
`;

const Title = styled.h2`
  margin-bottom: 20px;
  color: #000;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
`;

const Input = styled.input`
  padding: 10px;
  margin-bottom: 15px;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 16px;
  color: #000;
`;

const CheckboxContainer = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 15px;
  color: #000;
`;

const Checkbox = styled.input`
  margin-right: 10px;
`;

const CheckboxLabel = styled.label`
  font-size: 14px;
  color: #000;
`;

const Button = styled.button`
  padding: 10px;
  margin-bottom: 10px;
  border: none;
  border-radius: 5px;
  font-size: 16px;
  cursor: pointer;
  background-color: #0057d9;
  color: white;
`;

const GoogleButton = styled(Button)`
  background-color: #4285f4;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const GoogleIcon = styled.img`
  width: 20px; /* Adjust size as needed */
  height: 20px;
  margin-right: 10px;
`;

const Link = styled.a`
  color: #0057d9;
  text-align: center;
  display: block;
  margin-top: 10px;
  cursor: pointer;
  text-decoration: none;
  font-size: 12px;
  font-weight: bold;
`;

const Description = styled.p`
  z-index: 1;
  position: relative;
  color: white;
  font-size: 16px;
  max-width: 80%;
  line-height: 1.5;
`;

const Signup = () => {
  const dispatch: AppDispatch = useDispatch(); // Use AppDispatch to type dispatch
  const navigate = useNavigate();

  const handleGoogleSignIn = async () => {
    try {
      await dispatch(googleLogin()).unwrap(); // Properly unwrap the result
      navigate('/dashboard'); // Navigate to the dashboard
    } catch (error) {
      console.error('Google Signup Failed:', error);
    }
  };
  return (
    <Container>
      <LeftSection>
        <Logo>Visualisation App</Logo>
        <Description>
        Visualize Your Data — Make decisions that make an impact. Empower your team with the leading analytics platform. Easily create charts & graphs with Tableau. Start your free trial today! Free Trial.
        </Description>
        <ImageOverlay />
      </LeftSection>
      <RightSection>
        <FormContainer>
          <Title>Register Your Account!</Title>
          <Form>
            <Input type="text" placeholder="Your Full Name*" required />
            <Input type="email" placeholder="Email Address*" required />
            <Input type="password" placeholder="Create Password*" required />
            <CheckboxContainer>
              <Checkbox type="checkbox" id="terms" required />
              <CheckboxLabel htmlFor="terms">I agree to terms & conditions</CheckboxLabel>
            </CheckboxContainer>
            <Button type="submit">Register</Button>
            <GoogleButton type="button" onClick={handleGoogleSignIn}>
              <GoogleIcon src={GoogleLogo} alt="Google logo" /> Register with Google
            </GoogleButton>
          </Form>
          <Link href="#">Already have an account? Sign In</Link>
        </FormContainer>
      </RightSection>
    </Container>
  );
};

export default Signup;
