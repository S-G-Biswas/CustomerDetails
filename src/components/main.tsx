import React, { useState, useEffect, useRef } from 'react';
import '../App.css';

interface Customer {
  id: number;
  name: string;
  company: string;
  address: string;
}

const Main: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [start, setStart] = useState<number>(0);
  const limit = 5;

  const observer = useRef<IntersectionObserver | null>(null);
  const lastCustomerElementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Fetching initial set of customers
    fetchCustomers();
  }, [start]);

  useEffect(() => {
    // Setting up Intersection Observer
    observer.current = new IntersectionObserver(handleIntersection, {
      root: null,
      rootMargin: '0px',
      threshold: 0.1,
    });

    if (lastCustomerElementRef.current) {
      observer.current.observe(lastCustomerElementRef.current);
    }

    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, [customers]);

  useEffect(() => {
    // Fetching new photos for the selected customer every 10 seconds
    const intervalId = setInterval(fetchNewPhotos, 10000);
    return () => clearInterval(intervalId);
  }, [selectedCustomer]);

  const fetchCustomers = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('https://660ead7a356b87a55c4fbd26.mockapi.io/customer/users');
      const data = await response.json();
      const slicedData = data.slice(start, start + limit);
      setCustomers(prevCustomers => [...prevCustomers, ...slicedData]);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching customers: ', error);
      setIsLoading(false);
    }
  };

  const handleIntersection: IntersectionObserverCallback = (entries) => {
    const target = entries[0];
    if (target.isIntersecting) {
      // Load more customers
      setStart(start + limit);
    }
  };

  const selectCustomer = async (customer: Customer) => {
    setSelectedCustomer(customer);
    // Fetching new photos for the selected customer
    const newPhotoPromises = Array.from(Array(9).keys()).map((_, index) =>
      fetch(`https://source.unsplash.com/random/200x200?sig=${index + 1000}`) // Adding 1000 to ensure different photos
        .then(response => response.url)
    );

    try {
      const newPhotoUrls = await Promise.all(newPhotoPromises);
      setPhotoUrls(newPhotoUrls);
    } catch (error) {
      console.error('Error fetching new photos: ', error);
    }
  };

  const fetchNewPhotos = async () => {
    if (selectedCustomer) {
      const newPhotoPromises = Array.from(Array(9).keys()).map((_, index) =>
        fetch(`https://source.unsplash.com/random/200x200?sig=${index + 2000}`) // Adding 2000 to ensure different photos from the initial set
          .then(response => response.url)
      );

      try {
        const newPhotoUrls = await Promise.all(newPhotoPromises);
        setPhotoUrls(newPhotoUrls);
      } catch (error) {
        console.error('Error fetching new photos: ', error);
      }
    }
  };

  return (
    <div className='main'>
      <h1>Customer Details</h1>
      <div className="App">
        <div className="customer-list" style={{ maxHeight: '500px', overflowY: 'auto' }}>
          {customers.map((customer, index) => (
            <div
              key={customer.id}
              ref={index === customers.length - 1 ? lastCustomerElementRef : null}
              className={`customer-card ${selectedCustomer && selectedCustomer.id === customer.id ? 'selected' : ''}`}
              onClick={() => selectCustomer(customer)}
            >
              <h3>{customer.name}</h3>
              <p>{customer.company}</p>
            </div>
          ))}
          {isLoading && <p>Loading...</p>}
        </div>
        <div className="customer-details">
          {selectedCustomer && (
            <div>
              <h2>{selectedCustomer.name}</h2>
              <p>Title: {selectedCustomer.company}</p>
              <p>Address: {selectedCustomer.address}, {selectedCustomer.address}</p>
              <div className="photo-grid">
                {photoUrls.map((url, index) => (
                  <img
                    key={index}
                    src={url}
                    alt={`Photo ${index}`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Main;
