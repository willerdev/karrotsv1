import React from 'react';
import { Calendar, MapPin } from 'lucide-react';

const events = [
  {
    id: 1,
    title: 'Karrot Community Meetup',
    description: 'Join us for our monthly community meetup to discuss local issues and share ideas.',
    date: '2024-05-15',
    time: '18:00',
    location: 'Central Park, Kampala',
    image: 'https://source.unsplash.com/random/800x600?community'
  },
  {
    id: 2,
    title: 'Tech Startup Pitch Night',
    description: 'Local tech startups will pitch their ideas to investors and the community.',
    date: '2024-05-22',
    time: '19:30',
    location: 'Innovation Hub, Nairobi',
    image: 'https://source.unsplash.com/random/800x600?startup'
  },
  {
    id: 3,
    title: 'Karrot Marketplace Workshop',
    description: 'Learn how to make the most of Karrot Marketplace with our expert-led workshop.',
    date: '2024-06-01',
    time: '10:00',
    location: 'Karrot Office, Dar es Salaam',
    image: 'https://source.unsplash.com/random/800x600?workshop'
  },
  {
    id: 4,
    title: 'East African Artisan Fair',
    description: 'Discover unique handmade products from artisans across East Africa.',
    date: '2024-06-10',
    time: '09:00',
    location: 'Exhibition Center, Kigali',
    image: 'https://source.unsplash.com/random/800x600?artisan'
  }
];

const Events = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Upcoming Events</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {events.map((event) => (
          <div key={event.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
            <img src={event.image} alt={event.title} className="w-full h-48 object-cover" />
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-2">{event.title}</h2>
              <p className="text-gray-600 mb-4">{event.description}</p>
              <div className="flex items-center text-sm text-gray-500 mb-2">
                <Calendar size={16} className="mr-2" />
                <span>{event.date} at {event.time}</span>
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <MapPin size={16} className="mr-2" />
                <span>{event.location}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Events;