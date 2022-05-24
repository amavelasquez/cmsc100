import React, { Component } from "react";
import { Redirect, Link } from "react-router-dom";
import Cookies from "universal-cookie";
import './style.css';

export default class Feed extends Component {

    constructor(props){
        super(props);

        this.state = {
            posts: [],
            checkedIfLoggedIn: false,
            isLoggedin: null,
            username: localStorage.getItem("username")
        }

        this.logout = this.logout.bind(this);
        this.post = this.post.bind(this);
        // this.edit = this.edit.bind(this);
        this.delete = this.delete.bind(this);
    }

    componentDidMount() {
        // Send POST request to check if user is logged in
        fetch("http://localhost:3001/check-if-logged-in", {
            method: "POST",
            credentials: "include"
        })
        .then(response => response.json())
        .then(body => {
            if (body.isLoggedin) {
                this.setState({ checkedIfLoggedIn: true, isLoggedin: true, username: localStorage.getItem("username")});
            } else {
                this.setState({ checkedIfLoggedIn: true, isLoggedin: false });
            }
        });

        fetch("http://localhost:3001/find-all-posts")
        .then(response => response.json())
        .then(body => {
            this.setState({ posts : body })
        });
    }

    logout(e) {
        e.preventDefault();
    
        // Delete cookie with authToken
        const cookies = new Cookies();
        cookies.remove("authToken");
    
        // Delete username in local storage
        localStorage.removeItem("username");
    
        this.setState({ isLoggedin: false });
    }

    post(e) {
        e.preventDefault();

        var today = new Date();
        var date = today.getDate()+'-'+(today.getMonth()+1)+'-'+today.getFullYear();
        var time = today.getHours() + ":" + today.getMinutes();
        var timestamp = date.toString() + ' ' + time.toString();

        const post = {
            timestamp: timestamp,
            author: this.state.username,
            content: document.getElementById("f-content").value
        }

        fetch("http://localhost:3001/post-content", {
            method: 'POST',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(post)
        })
        .then(response => response.json())
        .then(body => {
            if (!body) {
                alert("Post has not been posted");
            } else {
                alert("Post has been posted");
                window.location.reload();
            }
        });
    }

    // edit(id){
    //     const payload = {
    //         content: 
    //     }
    // }

    delete(_id){
        const payload = { _id: _id }

        fetch("http://localhost:3001/delete-content", {
            method: 'DELETE',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        })
        .then(response => response.json())
        .then(body => {
            if (!body) {
                alert("Post has not been deleted");
            } else {
                
                window.location.reload();
            }
        });
    }

    render(){
        if (!this.state.checkedIfLoggedIn) {
            // delay redirect/render
            return (<div></div>)
        } else {
            if (this.state.isLoggedin) {
                // render the page
                return(
                    <html>
                        <div>
                            <button id="f-logout" onClick={this.logout}>Log Out</button>
                        </div>
                        <div id="post-form">
                            <input type="text" id="f-content" placeholder="What's on your mind?"/>
                            <button id="f-post" onClick={this.post}>Post</button>
                        </div>
                        <div>
                            {
                                this.state.posts.map((post, i) => {
                                    return <fieldset id="f-contents" key={i}><legend>{post.author} {post.timestamp}</legend><p>{post.content}</p>
                                    <button id="edit">Edit</button>
                                    <button id="delete" onClick={this.delete(post._id)}>Delete</button>
                                    </fieldset>
                                })
                            }
                        </div>
                    </html>
                ) 
            } else {
                // redirect
                return <Redirect to="/log-in" />
            }
        }
    }
}