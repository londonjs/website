import { useState, useEffect } from 'react';

const Countdown = ({ targetDate, targetTime, endTime, location }) => {
  const [timeLeft, setTimeLeft] = useState({
    days: '00',
    hours: '00',
    minutes: '00',
    seconds: '00'
  });

  useEffect(() => {
    function calculateTimeLeft() {

      const [eventHours, eventMinutes] = endTime.split(':');
      const endDateTime = new Date(targetDate);

      endDateTime.setHours(parseInt(eventHours), parseInt(eventMinutes), 0, 0);
      
      const now = new Date();
      const diff = endDateTime.getTime() - now.getTime();
      
      if (diff <= 0) {
        window.location.reload();
        return;
      }
      
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      setTimeLeft({
        days: days.toString().padStart(2, '0'),
        hours: hours.toString().padStart(2, '0'),
        minutes: minutes.toString().padStart(2, '0'),
        seconds: seconds.toString().padStart(2, '0')
      });
    }
    
    calculateTimeLeft();
    
    const timer = setInterval(calculateTimeLeft, 1000);
    
    return () => clearInterval(timer);
  }, [targetDate, endTime]);

  return (
    <div className="bg-white border-4 border-[#333333] rounded-3xl shadow-[8px_8px_0_#333333] p-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 text-center">
        <div className="countdown-item">
          <span className="block text-3xl sm:text-4xl md:text-6xl font-black">
            {timeLeft.days}
          </span>
          <span className="text-xs sm:text-sm uppercase tracking-wide">Days</span>
        </div>
        <div className="countdown-item">
          <span className="block text-3xl sm:text-4xl md:text-6xl font-black">
            {timeLeft.hours}
          </span>
          <span className="text-xs sm:text-sm uppercase tracking-wide">Hours</span>
        </div>
        <div className="countdown-item">
          <span className="block text-3xl sm:text-4xl md:text-6xl font-black">
            {timeLeft.minutes}
          </span>
          <span className="text-xs sm:text-sm uppercase tracking-wide">Minutes</span>
        </div>
        <div className="countdown-item">
          <span className="block text-3xl sm:text-4xl md:text-6xl font-black">
            {timeLeft.seconds}
          </span>
          <span className="text-xs sm:text-sm uppercase tracking-wide">Seconds</span>
        </div>
      </div>
    </div>
  );
};

export default Countdown;