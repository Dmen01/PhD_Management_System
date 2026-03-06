import React from 'react';
import { motion } from 'framer-motion';
import { User, GraduationCap, ShieldCheck, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const navigate = useNavigate();

  const variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-center items-center p-6 relative overflow-hidden">
      {/* Background decoration - Lighter, subtle */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-violet-500/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-500/10 rounded-full blur-[100px]" />
      </div>

      <motion.div
        initial="hidden"
        animate="visible"
        transition={{ duration: 0.8 }}
        className="max-w-6xl w-full text-center space-y-12 relative z-10"
      >
        <div className="space-y-4">
          <motion.h1 
            variants={variants}
            className="text-6xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-600 via-indigo-600 to-violet-600 tracking-tight pb-2"
          >
            PhD Management ERP
          </motion.h1>
          
          <motion.p 
            variants={variants}
            transition={{ delay: 0.2 }}
            className="text-xl text-slate-600 max-w-2xl mx-auto font-light"
          >
            Streamlining academic research, supervision, and administration in one unified platform.
          </motion.p>
        </div>

        <motion.div 
          variants={variants}
          transition={{ delay: 0.4 }}
          className="grid md:grid-cols-3 gap-6 lg:gap-8 mt-16 px-4"
        >
          <LoginCard 
            role="Student" 
            icon={<GraduationCap size={48} />} 
            description="Track your research progress, submit reports, and communicate with supervisors."
            color="violet"
            onClick={() => navigate('/login/student')}
          />
          <LoginCard 
            role="Teacher" 
            icon={<User size={48} />} 
            description="Oversee student progress, review submissions, and manage your research group."
            color="indigo"
            onClick={() => navigate('/login/teacher')}
          />
          <LoginCard 
            role="Admin" 
            icon={<ShieldCheck size={48} />} 
            description="System configuration, user management, and institutional reporting."
            color="cyan"
            onClick={() => navigate('/login/admin')}
          />
        </motion.div>
      </motion.div>
    </div>
  );
};

const LoginCard = ({ role, icon, description, onClick, color }) => {
  const colorClasses = {
    violet: "hover:border-violet-500 hover:shadow-violet-500/20 text-violet-600 group-hover:text-violet-700 bg-violet-50",
    indigo: "hover:border-indigo-500 hover:shadow-indigo-500/20 text-indigo-600 group-hover:text-indigo-700 bg-indigo-50",
    cyan: "hover:border-cyan-500 hover:shadow-cyan-500/20 text-cyan-600 group-hover:text-cyan-700 bg-cyan-50"
  };

  return (
    <motion.div 
      whileHover={{ scale: 1.03, translateY: -5 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`bg-white border border-slate-200 p-8 rounded-3xl cursor-pointer hover:shadow-2xl transition-all duration-300 group flex flex-col items-center text-center ${colorClasses[color].split(' ').slice(0, 2).join(' ')}`}
    >
      <div className={`mb-6 p-4 rounded-2xl ${colorClasses[color]}`}>
        {icon}
      </div>
      <h3 className="text-2xl font-bold mb-3 text-slate-800">{role}</h3>
      <p className="text-slate-500 text-sm mb-8 leading-relaxed flex-grow">{description}</p>
      <div className={`flex items-center text-sm font-semibold group-hover:gap-2 transition-all ${colorClasses[color].split(' ').slice(2).join(' ')}`}>
        <span>Access Portal</span>
        <ArrowRight size={16} className="ml-2" />
      </div>
    </motion.div>
  );
};

export default LandingPage;
