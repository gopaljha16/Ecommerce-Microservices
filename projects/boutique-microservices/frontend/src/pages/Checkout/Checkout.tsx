import React, { useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Container,
  Divider,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { orderService } from '../../services/orderService';
import { Address } from '../../types';

const initialAddress: Address = {
  street: '',
  city: '',
  state: '',
  zipCode: '',
  country: '',
};

const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const { items, total, clearCart } = useCart();
  const [shippingAddress, setShippingAddress] = useState<Address>(initialAddress);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const isAddressComplete = useMemo(
    () => Object.values(shippingAddress).every(value => value.trim().length > 0),
    [shippingAddress]
  );

  const handleAddressChange = (field: keyof Address) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setShippingAddress(prev => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handlePlaceOrder = async () => {
    if (items.length === 0) {
      navigate('/cart');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await orderService.createOrder({
        items: items.map(item => ({
          productId: item.id,
          quantity: item.quantity,
        })),
        shippingAddress,
      });

      clearCart();
      navigate('/orders');
    } catch (err) {
      setError('Could not place your order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h4" gutterBottom>
            Your cart is empty
          </Typography>
          <Button variant="contained" onClick={() => navigate('/products')}>
            Continue Shopping
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 5 }}>
      <Typography variant="h3" sx={{ mb: 3 }}>
        Checkout
      </Typography>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 7fr) minmax(320px, 5fr)' },
          gap: 3,
        }}
      >
        <Box>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h5" sx={{ mb: 3 }}>
              Shipping Address
            </Typography>

            <Stack spacing={2}>
              <TextField
                label="Street"
                value={shippingAddress.street}
                onChange={handleAddressChange('street')}
                fullWidth
                required
              />
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                  gap: 2,
                }}
              >
                <Box>
                  <TextField
                    label="City"
                    value={shippingAddress.city}
                    onChange={handleAddressChange('city')}
                    fullWidth
                    required
                  />
                </Box>
                <Box>
                  <TextField
                    label="State"
                    value={shippingAddress.state}
                    onChange={handleAddressChange('state')}
                    fullWidth
                    required
                  />
                </Box>
              </Box>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                  gap: 2,
                }}
              >
                <Box>
                  <TextField
                    label="ZIP code"
                    value={shippingAddress.zipCode}
                    onChange={handleAddressChange('zipCode')}
                    fullWidth
                    required
                  />
                </Box>
                <Box>
                  <TextField
                    label="Country"
                    value={shippingAddress.country}
                    onChange={handleAddressChange('country')}
                    fullWidth
                    required
                  />
                </Box>
              </Box>
            </Stack>
          </Paper>
        </Box>

        <Box>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h5" sx={{ mb: 2 }}>
              Order Summary
            </Typography>

            <Stack spacing={2}>
              {items.map(item => {
                const price = typeof item.price === 'string' ? parseFloat(item.price) : item.price;
                return (
                  <Box key={item.id}>
                    <Stack direction="row" justifyContent="space-between" gap={2}>
                      <Box>
                        <Typography variant="subtitle1">{item.name}</Typography>
                        <Typography variant="body2">Qty {item.quantity}</Typography>
                      </Box>
                      <Typography variant="subtitle1">
                        ${(price * item.quantity).toFixed(2)}
                      </Typography>
                    </Stack>
                  </Box>
                );
              })}
            </Stack>

            <Divider sx={{ my: 3 }} />

            <Stack direction="row" justifyContent="space-between" sx={{ mb: 3 }}>
              <Typography variant="h6">Total</Typography>
              <Typography variant="h6">${total.toFixed(2)}</Typography>
            </Stack>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <Button
              variant="contained"
              size="large"
              fullWidth
              disabled={!isAddressComplete || isSubmitting}
              onClick={handlePlaceOrder}
            >
              {isSubmitting ? 'Placing Order...' : 'Place Order'}
            </Button>
          </Paper>
        </Box>
      </Box>
    </Container>
  );
};

export default Checkout;
