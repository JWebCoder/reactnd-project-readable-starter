/* global history */
import React, {Component} from 'react'
import Layout from 'components/Layout'
import postsService from 'services/posts'
import categoriesService from 'services/categories'
import { bindActionCreators } from 'redux'
import * as PostActions from 'reducers/posts/actions'
import * as CategoriesActions from 'reducers/categories/actions'
import {connect} from 'react-redux'
import uuidv1 from 'uuid/v1'
import {Link} from 'react-router-dom';

const mapStateToProps = state => (
  {
    post: state.posts.current,
    categories: state.categories.items
  }
)

const mapDispatchToProps = dispatch => (
  {
    actions: bindActionCreators({...PostActions, ...CategoriesActions}, dispatch)
  }
)

class Post extends Component {
  constructor(props) {
    super(props)

    if (!this.props.match.params.post_id) {
      this.isNew = true
    }
  }

  componentDidMount() {
    if (this.props.match.params.post_id) {
      postsService.getPost(this.props.match.params.post_id).then(
        post => {
          this.props.actions.setCurrentPost(post)
        }
      )
    } else {
      this.props.actions.setCurrentPost({})
    }

    if (this.props.categories.length === 0) {
      categoriesService.getCategories().then(
        categories => {
          this.props.actions.setCategories(categories.data)
        }
      )
    }
  }

  back() {
    if (this.props.location.state && this.props.location.state.fromPost) {
      window.history.back()
    } else {
      this.props.history.push({
        pathname: `/${this.props.post.category}/${this.props.post.id}`
      })
    }
  }

  updatePost(field, value) {
    const post = {
      ...this.props.post,
      [field]: value
    }
    this.props.actions.setCurrentPost(post)
  }

  savePost() {
    postsService.savePost(this.props.post)
  }

  createPost() {
    postsService.createPost({
      ...this.props.post,
      id: uuidv1()
    })
  }

  render() {
    let {title, body, author, id} = this.props.post
    return(
      <Layout>
        <div className='post-view-edit'>
          {!id && (
            <h1>New post</h1>
          )}
          {(id && (
            <div className='post-actions'>
              <div className='menu-item'>
                <button className='link menu-link' onClick={() => this.savePost()}>Save</button>
              </div>
              <div className='menu-item'>
                <button className='link menu-link' onClick={() => this.delete(id)}>Delete</button>
              </div>
              <div className='menu-item'>
                <button className='link menu-link' onClick={() => this.back()}>Back</button>
              </div>
            </div>
          )) || (
            <div className='post-actions'>
              <div className='menu-item'>
                <button className='link menu-link' onClick={() => this.createPost()}>Create</button>
              </div>
              <div className='menu-item'>
                <Link className='link menu-link' to='/'>Back</Link>
              </div>
            </div>
          )}



          <article className='post-content'>
            <header>
              Title: <input
                type='text'
                value={title || ''}
                onChange={(event) => {
                  this.updatePost('title', event.target.value);
                }}
                />
              <br/>
              Author: {(this.isNew && (<input
                type='text'
                value={author || ''}
                onChange={(event) => {
                  this.updatePost('author', event.target.value);
                }}
                />))
                || (<span>{author}</span>)}
            </header>
            <div className='body'>
              <textarea
                value={body || ''}
                onChange={(event) => {
                  this.updatePost('body', event.target.value);
                }}
                />
            </div>
            <select
              value={this.props.post.category}
              onChange={(event) => {
                this.updatePost('category', event.target.value);
              }}
              >
              {this.props.categories.map(
                (category, index) => (
                  <option key={index} value={category.name}>{category.name}</option>
                )
              )}
            </select>
          </article>
        </div>
      </Layout>
    )
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Post)
