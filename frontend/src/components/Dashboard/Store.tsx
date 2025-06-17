import { useLocation } from 'react-router-dom';
import StoreContent from './StoreContent';

export default function Store() {
  const location = useLocation();
  return <StoreContent key={`store-${location.pathname}`} />;
}