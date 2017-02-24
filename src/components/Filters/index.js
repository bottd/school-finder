import React, { Component } from 'react';
// import { Link } from 'react-router';
import firebase from '../../firebase';
import { pick, map, extend } from 'lodash';
import './filters-style.css';

export default class Filters extends Component {
  constructor() {
    super()
    this.state = {
      gradeLevel: '',
      schoolType: '',
      carMode: false,
      publicMode: false,
      bikeMode: false,
      walkMode: false,
      commuteDist: 15,
      commuteTime: 30,
      schoolResults: []
    }
  }

  handleChange(evt) {
    let key = evt.target.id;
    let val = evt.target.type === 'checkbox' ? evt.target.checked : evt.target.value;
    let obj = {};
    obj[key] = val;
    this.setState(obj);
  }

  //cleanup when school results display is working (i.e. add logic for filering school results)
  findSchools() {
    let { gradeLevel, schoolType } = this.state;
    console.log('School!');
    console.log(gradeLevel, schoolType);
    // //fetch schools from Firebase
    firebase.database().ref().on('value', snap => {
      //add a function here to filter that each snap has gradeLevel && schoolType
      console.log(snap.val());
    })
    // firebase.database().ref('dps_schools').on('value', (snapshot) => {
    //     const schoolResults = snapshot.val() || {};
    //     this.setState({
    //       schoolResults: map(schoolResults, (val, key) => extend(val, { key })),
    //     });
    //   });
    //   console.log(this.state.schoolResults)
  }

  getCommuteData() {
    let { carMode, publicMode, bikeMode, walkMode } = this.state
    console.log('Commute!')
    console.log(carMode, publicMode, bikeMode, walkMode)
  }
//
  handleFinder() {
    this.findSchools();
    this.getCommuteData();
  }

  render() {
    return (
      <div className='filter-container'>
        <h2 className='filter-header'>Search Filters</h2>
        <section className='filter-fields'>
          <article className='filter-item'>
            <h4>Grade Level</h4>
            <select id='gradeLevel' value={ this.state.gradeLevel } onChange={(e) => this.handleChange(e)}>
              <option value=''>Select grade level...</option>
              <option value='ece-prek'>ECE/Pre-K</option>
              <option value='k-5'>K-5</option>
              <option value='6-8'>6-8</option>
              <option value='9-12'>9-12</option>
            </select>
          </article>
          <article className='filter-item'>
            <h4>School Type</h4>
            <select id='schoolType' value={ this.state.schoolType } onChange={(e) => this.handleChange(e)}>
              <option value=''>Select school type...</option>
              <option value='public'>Public/District</option>
              <option value='charter'>Charter</option>
              <option value='magnet'>Magnet</option>
              <option value='9-12'>9-12</option>
            </select>
          </article>
          <article className='filter-item'>
            <h4>Transportation Options</h4>
            <input type='checkbox' id='carMode' value={ this.state.gradeLevel } onChange={(e) => this.handleChange(e)} />
            <label>Car</label><br/>
            <input type='checkbox' id='publicMode' value={ this.state.gradeLevel } onChange={(e) => this.handleChange(e)} />
            <label>Public Transit</label><br/>
            <input type='checkbox' id='bikeMode' value={ this.state.gradeLevel } onChange={(e) => this.handleChange(e)} />
            <label>Bike</label><br/>
            <input type='checkbox' id='walkMode' value={ this.state.gradeLevel } onChange={(e) => this.handleChange(e)} />
            <label>Walk</label>
          </article>
          <article className='filter-item'>
            <h4>Commute Distance</h4>
            <input
              id='commuteDist'
              className='slider'
              type="range"
              max="30"
              value={this.state.commuteDist}
              onChange={(e) => this.handleChange(e)}
            />
            <p className='slider-data'>{this.state.commuteDist} miles</p>
          </article>
          <article className='filter-item'>
            <h4>Commute Time</h4>
            <input
              id='commuteTime'
              className='slider'
              type="range"
              max="60"
              value={this.state.commuteTime}
              onChange={(e) => this.handleChange(e)}
            />
            <p className='slider-data'>{this.state.commuteTime} mins</p>
          </article>
        </section>
        <button
          className='search-btn'
          onClick={ () => this.handleFinder() }
        >Find Schools</button>
      </div>
    )
  }
}
