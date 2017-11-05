import React, { Component } from 'react';
import firebase from '../../firebase';
import SearchResults from '../SearchResults';
import getGeoLocation from '../Helpers/getGeoLocation.js';
import googleDistanceMatrix from '../Helpers/googleDistanceMatrix.js';
import googleDirections from '../Helpers/googleDirections.js';
import filterContainer from '../../containers/Filters-container'
import SearchSpinner from '../SearchSpinner'
// import findSchools from '../Helpers/findSchools.js'
import './filters-style.css';

class Filters extends Component {
  constructor() {
    super()
    this.state = {
      gradeLevel: '',
      schoolType: '',
      transitMode: 'DRIVING',
      commuteDist: 15,
      commuteTime: 30,
      viewFilters: true,
      homeAddress: '',
      selectedSchool: '',
      hideFilter: false
    }
  }

  handleChange(evt) {
    let key = evt.target.id;
    let val = evt.target.type === 'checkbox' ? evt.target.checked : evt.target.value;
    let obj = {};
    obj[key] = val;
    this.setState(obj);
  }

  //Get home address coords and set in store
  handleHomeAddress(e) {
    if (e.target.value !== "") {
      getGeoLocation(e.target.value, this.homeCallback.bind(this));
    }
  }

  homeCallback(homeAddressCoords) {
    this.props.setHomeAddress(homeAddressCoords)
  }

  //Get schools in FB, filter them, receive commut info from Google, and set to store
  findSchools() {
    this.props.activeSearchToggle()
    let { schoolType, gradeLevel, transitMode } = this.state;
    fetch(`https://cdoe-data-api.herokuapp.com/api/v1/schools?type=${schoolType}&grade_levels=${gradeLevel}`)
    .then(data => data.json())
    .then(finalSchools => {
      console.log(finalSchools)
      this.getGoogleDistances(finalSchools, transitMode)
    })
  }

  getGoogleDistances(finalSchools, transitMode) {
    let dataLength = finalSchools.length
    let count = Math.ceil(dataLength / 25)
    console.log(count)
    for (let i = 0; i < count; i++) {
      let begin = i * 25
      let end = i * 25 + 25
      let data = finalSchools.slice(begin, end)
      let callBack = (response) => {
        let { commuteDist, commuteTime } = this.state
        console.log(response)
        let finalSchoolData = response.rows[0].elements.map((school, i) => {
          return Object.assign({}, data[i], { commute: { distance: {text: school.distance.text, value: school.distance.value},
                                              time: {text: school.duration.text, value: school.duration.value} },
                                              showInfo: false } )
        })
        this.props.setSchools(finalSchoolData, commuteTime, commuteDist);
      }
      googleDistanceMatrix(this.props.schoolResults.homeAddress, data, transitMode, callBack)
    }
    this.toggleFilterView()
  }

  //Filter view functionality
  toggleFilterView() {
    this.setState({ viewFilters: !this.state.viewFilters, selectedSchool: '' }, this.resetMap())
  }

  resetMap() {
    if (!this.state.viewFilters) {
      this.props.clearDirections()
      this.props.clearSchools()
    } else {
      this.props.clearDirections()
      window.setTimeout(this.props.activeSearchToggle, 300)
    }
  }

  directionsCallback(result, status) {
    if (status === 'OK') {
      this.props.setDirections(result);
    }
  }

  selectSchool(school) {
    this.setState({ selectedSchool: school.name }, () => {
      googleDirections(this.props.schoolResults.homeAddress, school, this.state.transitMode, this.directionsCallback.bind(this))
    })
    this.slideFilterComponent()
  }

  slideFilterComponent() {
    this.setState({ hideFilter: !this.state.hideFilter })
  }

  render() {
    return (
      <div>
        <button className={ this.state.hideFilter ? "slide-filter-btn hidden" : "slide-filter-btn"} onClick={ () => this.slideFilterComponent() }>{this.state.hideFilter ? '>' : '<' }</button>
        <div className={ this.state.hideFilter ? 'filter-container hidden' : 'filter-container'}>
          {this.state.viewFilters ?
            <div>
              <h2 className='filter-header'>Search Filters</h2>
              <form className='filter-fields'>
                <article className='filter-item'>
                  <h4>Home Street Address</h4>
                  <input id='homeAddress' type='text' value={ this.state.homeAddress } onChange={ (e) => this.handleChange(e)} onBlur={ (e) => this.handleHomeAddress(e) } />
                </article>
                <article className='filter-item'>
                  <h4>Grade Level</h4>
                  <select id='gradeLevel' value={ this.state.gradeLevel } onChange={(e) => this.handleChange(e)}>
                    <option value=''>Select grade level...</option>
                    <option value='1'>ECE/Pre-K</option>
                    <option value='2'>K-5</option>
                    <option value='3'>6-8</option>
                    <option value='4'>9-12</option>
                  </select>
                </article>
                <article className='filter-item'>
                  <h4>School Type</h4>
                  <select id='schoolType' value={ this.state.schoolType } onChange={(e) => this.handleChange(e)}>
                    <option value=''>Select school type...</option>
                    <option value='Public'>Public/District</option>
                    <option value='Charter'>Charter</option>
                    <option value='Other'>Other</option>
                  </select>
                </article>
                <article className='filter-item'>
                  <h4>Transportation Options</h4>
                  <label>
                    <input
                      type='radio'
                      onChange={ () => this.setState({ transitMode: 'DRIVING' }) }
                      checked={this.state.transitMode === 'DRIVING'}
                    />
                  Car</label><br/>
                  <label>
                    <input
                      type='radio'
                      onChange={ () => this.setState({ transitMode: 'TRANSIT' })}
                      checked={this.state.transitMode === 'TRANSIT'}
                    />
                  Public Transit</label><br/>
                  <label>
                    <input
                      type='radio'
                      onChange={ () => this.setState({ transitMode: 'BICYCLING' })}
                      checked={this.state.transitMode === 'BICYCLING'}
                    />
                  Bike</label><br/>
                  <label>
                    <input
                      type='radio'
                      onChange={ () => this.setState({ transitMode: 'WALKING' })}
                      checked={this.state.transitMode === 'WALKING'}
                    />
                  Walk</label><br/>
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
              </form>
              <button
                className='search-btn'
                onClick={ () => this.findSchools() }
                disabled={ !this.state.gradeLevel || !this.state.schoolType }
              >Find Schools</button>
            </div>
            :
            <div className='results-container'>
              <div className='results-header-container'>
                <h2 className='filter-header'>Search Results</h2>
                <button
                  className='filter-back-btn'
                  onClick={ () => this.toggleFilterView() }
                >« Back To Filters</button>
              </div>
              { this.props.activeSearch ? <SearchSpinner />
              : this.props.schoolResults.schools.length > 0 ? this.props.schoolResults.schools.map((school, i) => {
                return (
                  <SearchResults
                      key={ i }
                      refNum={ i }
                      schoolData={ school }
                      selectedSchool={this.state.selectedSchool}
                      selectSchool={ this.selectSchool.bind(this) } />
                )
              }) : <h4>Looks like your search came up empty.  Try again but with different filter settings!</h4> }
            </div>
            }
        </div>
      </div>
    )
  }
}

export default filterContainer(Filters)
