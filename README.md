# Hospital-Management-System

Hospital Management System – Fullstack Web App with React & ASP.NET MVC

---

## **Description**
This project is a web-based Hospital Management System (HMS) designed to manage patients, doctors, appointments, billing, and reports efficiently.  
It provides role-based access for admins, doctors, and patients with dynamic reporting and automated workflows.

---

## **Tech Stack**
- **Frontend:** React.js  
- **Backend:** ASP.NET MVC + ADO.NET  
- **Database:** MySQL  
- **Testing:** NUnit, Selenium, JMeter  
- **CI/CD & Deployment:** GitHub Actions + Azure App Service + Docker  
- **Version Control:** Git & GitHub  

---

## **Features**
- Online patient registration and management  
- Doctor availability and scheduling  
- Appointment booking and history tracking  
- Billing, invoice generation, and payment tracking  
- Dynamic reports for admins  
- Role-based authentication and authorization  

---

## **Folder Structure**

```
Hospital-Management-System/
│── frontend/                  # React.js frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── styles/
│
│── backend/                   # ASP.NET MVC backend
│   ├── Controllers/
│   ├── Models/
│   ├── Views/
│   ├── Services/
│   ├── Repositories/
│   └── Tests/
│
│── database/
│   ├── schema.sql
│   └── seed_data.sql
│
│── reports/
│   ├── dynamic_reports/
│   └── performance_tests/
│
│── deployment/
│   ├── Dockerfile
│   ├── docker-compose.yml
│   └── azure-pipeline.yml
│
│── docs/
│   ├── SRS.pdf
│   ├── Architecture.png
│   └── API_Documentation.pdf
│
└── README.md
```
---

## **Setup Instructions**
1. Clone the repository:
```bash
    git clone https://github.com/<username>/Hospital-Management-System.git
```

2. Install frontend dependencies:

```bash
    cd frontend
    npm install
```

3. Build backend project in Visual Studio and set up MySQL database using:

```bash
    database/schema.sql
```

4. Run the application locally:

- Frontend: 
```bash
    npm start
```

- Backend: Start the ASP.NET MVC project from Visual Studio

---

## **Usage**

- Admins can manage patients, doctors, appointments, and billing

- Doctors can view schedules and appointments

- Patients can register and book appointments online

---

## **Contribution**

1. Fork the repository

2. Create a feature branch:

```bash
git checkout -b feature/<module>
```

3. Commit your changes:

```bash
git commit -m "Add <feature>"
```

4. Push to the branch:

```bash
git push origin feature/<module>
```

5. Create a Pull Request into develop

---

## **License**

This project is licensed under the MIT License. See the LICENSE
 file for details.


---