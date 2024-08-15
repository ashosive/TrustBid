import * as React from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import InstagramIcon from '@mui/icons-material/Instagram';
import YouTubeIcon from '@mui/icons-material/YouTube';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import CloseIcon from '@mui/icons-material/Close';

interface FooterProps {
  // Add any custom props here if needed
}

const Footer: React.FC<FooterProps> = () => {
  return (
    <Box component="footer" sx={{ backgroundColor: 'white',  padding: '40px 20px', width: '100%' }}>
      <Container maxWidth="md">
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Stack direction="row" spacing={2}>
            <CloseIcon style={{ color: 'black'}} />
            <Link href="#" target="_blank" rel="noopener noreferrer" style={{ color: 'black'}}>
              <InstagramIcon />
            </Link>
            <Link href="#" target="_blank" rel="noopener noreferrer" style={{ color: 'black'}}>
              <YouTubeIcon />
            </Link>
            <Link href="#" target="_blank" rel="noopener noreferrer" style={{ color: 'black'}}>
              <LinkedInIcon />
            </Link>
          </Stack>
          <Typography variant="body1" component="p" style={{ color: 'black'}}>
            Contact us - About us - Help
          </Typography>
        </Stack>
      </Container>
    </Box>
  );
};

export default Footer;