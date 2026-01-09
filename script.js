'use strict';

const properties = [];
const landlords = [];

class Property {
  applications = [];
  tenants = [];

  constructor(property) {
    Object.assign(this, property);
    this.updateProperties();
  }

  isOwned(landlordName) {
    if (this.landlord) {
      return;
    }

    return this.#sellProperty(landlordName);
  }

  #sellProperty(landlordName) {
    this.landlord = landlordName;
    return `Property now belongs to ${this.landlord}`;
  }

  updateProperties() {
    properties.push(this);
  }
}

const propertyOne = new Property({
  id: '001',
  address: '12 Maple Street, New York',
  type: 'Studio',
  sizeSqm: 38,
  rentAmount: 950,
  furnished: true,
  occupied: false,
});

const propertyTwo = new Property({
  id: '002',
  address: '88 River Lane, New York',
  type: '2-bedroom apartment',
  sizeSqm: 72,
  rentAmount: 1750,
  furnished: false,
  occupied: false,
});

class Application {
  constructor(
    applicant,
    applicationID,
    propertyID,
    moveInDate,
    reasonForMoving
  ) {
    this.applicant = applicant;
    this.applicationID = applicationID;
    this.propertyID = propertyID;
    this.moveInDate = moveInDate;
    this.reasonForMoving = reasonForMoving;
    this.#setRentAppStatus();
    this.#sendApplication();
  }

  #setRentAppStatus() {
    this.status = 'pending';
  }

  #sendApplication() {
    const property = properties.find(
      property => property.id === this.propertyID
    );

    if (
      !this.applicant.occupation ||
      this.applicant.monthlyIncome / property.rentAmount < 3
    ) {
      return;
    }

    property.applications.push(this);
  }
}

class Rent {
  constructor(tenant, amount, date, id) {
    this.tenant = tenant;
    this.amount = amount;
    this.date = date;
    this.id = id;
  }
}

// TODO:
// set different request types as not all types have to be maintenance
class TenantRequest {
  constructor(tenant, type, reason) {
    this.tenant = tenant;
    this.reason = reason;
  }
}

class Person {
  constructor(firstName, lastName) {
    this.firstName = firstName;
    this.lastName = lastName;
    this.getName();
  }

  getName() {
    this.fullName = `${this.firstName} ${this.lastName}`;
  }
}

class HomeSeeker extends Person {
  constructor(firstName, lastName, userName, occupation, age, monthlyIncome) {
    super(firstName, lastName);
    this.occupation = occupation;
    this.age = age;
    this.monthlyIncome = monthlyIncome;
    this.userName = userName;
  }

  sendRentApplication(propertyID, applicationID, moveInDate, reasonForMoving) {
    return new Application(
      this,
      applicationID,
      propertyID,
      moveInDate,
      reasonForMoving
    );
  }

  checkIfTenant() {
    const tenant = properties
      .flatMap(property => property.tenants)
      .find(tenant => tenant.userName === this.userName);

    if (!tenant) {
      console.log(`sorry, ${this.fullName}, you are not a recognized tenant`);
      return;
    }

    return tenant;
  }
}

class Tenant extends Person {
  #rentsPaid = [];
  #requests = [];

  constructor(
    firstName,
    lastName,
    occupation,
    age,
    monthlyIncome,
    propertyID,
    userName
  ) {
    super(firstName, lastName);
    this.occupation = occupation;
    this.age = age;
    this.monthlyIncome = monthlyIncome;
    this.propertyID = propertyID;
    this.userName = userName;
  }

  payRent(amount) {
    // const date = new Date();
    // const rentID = (Date.now() + '').slice(-10);
    // const rent = new Rent(this.fullName, amount, date, rentID);

    console.log(amount);
  }

  makeRequest(reason) {
    if (!this.canRent) {
      return;
    }

    const request = new TenantRequest(this.fullName, reason);
    // TenantRequests.push(request);
    // this.#requests.push(request);
  }
}

// const jane = new Tenant('Jane', 'Ola', 'Chef', 41, 5700, '001', 'JO1821');

class Landlord extends Person {
  #rentsReceived = [];
  #properties = [];

  constructor(firstName, lastName) {
    super(firstName, lastName);
  }

  buyProperty(propertyID) {
    const property = properties.find(property => property.id === propertyID);
    if (property.isOwned(this.fullName)) {
      this.#properties.push(property);
    }
  }

  approveApplication(propertyID, applicationID, decision) {
    decision = decision.toLowerCase();

    const property = this.#properties.find(
      property => property.id === propertyID
    );

    if (!property) {
      console.log(`You dont own a property with ID: ${propertyID}`);
      return;
    }

    if (property.tenants.length) {
      console.log(
        `Property ${propertyID} is already occupied by ${property.tenants[0].fullName}`
      );
      return;
    }

    const applications = property?.applications;

    if (!applications) {
      console.log(`There are no applications`);
      return;
    }

    const application = applications.find(
      app => app.applicationID === applicationID
    );

    if (!application) {
      console.log(`Cant find an application with ID: ${applicationID}`);
      return;
    }

    const setApprovedApplication = function (apps) {
      let application;

      for (let i = 0; i < apps.length; i++) {
        if (apps[i].applicationID !== applicationID) {
          apps[i].status = 'rejected';
          continue;
        }

        apps[i].status = 'approved';

        application = apps[i];
      }

      return application;
    };

    switch (decision) {
      case 'approved':
        this.setTenant(setApprovedApplication(applications));
        break;
      case 'rejected':
        application.status = decision;
        break;
      default:
        console.log('invalid decision');
    }
  }

  setTenant(app) {
    if (app.status !== 'approved') {
      return;
    }

    const firstName = app.applicant.firstName;
    const lastName = app.applicant.lastName;
    const occupation = app.applicant.occupation;
    const age = app.applicant.age;
    const monthlyIncome = app.applicant.monthlyIncome;
    const propertyID = app.propertyID;
    const userName = app.applicant.userName;

    const newTenant = new Tenant(
      firstName,
      lastName,
      occupation,
      age,
      monthlyIncome,
      propertyID,
      userName
    );

    const property = this.#properties.find(
      property => property.id === propertyID
    );

    property.tenants.push(newTenant);
  }

  setRentAmount(propertyID, amount) {
    const property = this.#properties.find(
      property => property.id === propertyID
    );

    if (!property) {
      return;
    }

    property.rentAmount = amount;
  }

  receiveRent() {}
  approveMaintenance() {}
}

const PeterLandlord = new Landlord('Peter', 'Neto');
const GregLandlord = new Landlord('Greg', 'Adams');
PeterLandlord.buyProperty('001');
PeterLandlord.buyProperty('002');
// GregLandlord.buyProperty('001');

// prettier-ignore
const JohnDoe = new HomeSeeker('John', 'Doe', 'johndoe', 'Student', 29, 1350);
const AlexSong = new HomeSeeker(
  'Alex',
  'Song',
  'alexsong',
  'Software Engineer',
  29,
  5350
);
// prettier-ignore
const JessicaDaniels = new HomeSeeker('Jessica', 'Daniels', 'jessicadaniels', 'Teacher', 25, 4250);
const KyleDavies = new HomeSeeker(
  'Kyle',
  'Davies',
  'kyledavies',
  'Accountant',
  45,
  6150
);

JohnDoe.sendRentApplication('001', 'JD1234', '2025-02-14', 'For study');
AlexSong.sendRentApplication('001', 'AS0923', '2025-01-24', 'For work');
// prettier-ignore
JessicaDaniels.sendRentApplication('001', 'JD1092', '2025-03-05', 'To get closer to family');
// prettier-ignore
KyleDavies.sendRentApplication('002', 'KD0543', '2025-02-01', 'In need of bigger space')
AlexSong.sendRentApplication('002', 'AS0924', '2025-01-24', 'For work');

PeterLandlord.approveApplication('001', 'AS0923', 'approved');
// PeterLandlord.approveApplication('001', 'JD1092', 'approved');
// PeterLandlord.approveApplication('002', 'AS0924', 'approved');

console.log(PeterLandlord);

// AlexSong.checkIfTenant().payRent(2000);

AlexSong.checkIfTenant().payRent(3000);

KyleDavies.checkIfTenant();
