import React, { Component } from 'react';
import './user-profile.css';
import Favorites from '../Favorites/Favorites';
import alias from '../../assets/user.svg';

export default class UserProfile extends Component {
  constructor() {
    super()
    this.state = {
      hideProfile: true,
      favorites: [{name: 'North', id: 1}, {name: 'South', id: 2}, {name: 'East', id: 3}, {name: 'West', id: 4}]
    }
  }

  slideProfileComponent() {
    this.setState({ hideProfile: !this.state.hideProfile })
  }

  render() {
    const { name, email, photo } = this.props;
    const { hideProfile, favorites } = this.state;

    const mappedFavorites = this.state.favorites.map( school => <Favorites school={ school } key={ school.name } /> );

    return (

      <div className='profile'>
      
        <button className={ hideProfile ? "slide-profile-btn hidden-profile" : "slide-profile-btn"} onClick={ () => this.slideProfileComponent() }>{hideProfile ? '<' : '>' }</button>

        <div className={ hideProfile ? 'avatar show-avatar' : 'avatar'}>
          <img src={ photo ? photo : alias } alt='avatar' className='avatar-photo' />          
        </div>

        <div className={ hideProfile ? 'profile-container hide-profile' : 'profile-container' }>
          
          <h2 className='profile-header'>{ name }</h2>

          <img src={ photo ? photo : alias } alt='avatar' className='user-photo' />

          <div className='user-info'>
            <h4 className="address">1771 17th St. Denver, CO. 80201 USA MothaLicka</h4>
            <h4 className='email'>{ email }</h4>
          </div>

          <div className='favorite-schools'>
            { mappedFavorites }
          </div>
        
        </div>

      </div>
    )
  };
};